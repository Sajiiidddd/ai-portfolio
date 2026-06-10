import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fromRequest as getUserIdFromCookie, attachUserCookie as setCookieOnResponse } from '@/lib/identity';
import { rateLimit, ipOf } from '@/lib/ratelimit';

// POST — toggle the requesting visitor's heart on a comment.
// One heart per identity per comment (DB unique). Returns the fresh count + state.
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; commentId: string }> }
) {
  const { commentId } = await context.params;

  if (!(await rateLimit(`l:${ipOf(req)}`, 60, 60_000))) {
    return NextResponse.json({ error: 'Too many likes — slow down.' }, { status: 429 });
  }
  if (!commentId) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { userId, isNew } = getUserIdFromCookie(req);

  // The comment must exist (and we won't let people like their own).
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true },
  });
  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }
  if (comment.userId === userId) {
    return NextResponse.json({ error: 'You cannot like your own comment.' }, { status: 403 });
  }

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: `${userId}@local.fake`, name: 'Anonymous' },
  });

  const existing = await prisma.commentLike.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });

  let liked: boolean;
  if (existing) {
    await prisma.commentLike.delete({ where: { id: existing.id } });
    liked = false;
  } else {
    await prisma.commentLike.create({ data: { userId, commentId } });
    liked = true;
  }

  const likeCount = await prisma.commentLike.count({ where: { commentId } });

  const response = NextResponse.json({ liked, likeCount });
  if (isNew) setCookieOnResponse(response, userId);
  return response;
}
