import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fromRequest as getUserId, attachUserCookie } from '@/lib/identity';
import { rateLimit, ipOf } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  if (!(await rateLimit(`rv:${ipOf(req)}`, 60, 60_000))) {
    return NextResponse.json({ error: 'Too many votes — slow down.' }, { status: 429 });
  }
  const { recommendationId, voteType } = (await req.json().catch(() => ({}))) as { recommendationId?: string; voteType?: string };
  if (!recommendationId || !['UPVOTE', 'DOWNVOTE'].includes(String(voteType))) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { userId, isNew } = getUserId(req);
  const rec = await prisma.recommendation.findUnique({ where: { id: recommendationId }, select: { id: true } });
  if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existing = await prisma.recommendationVote.findUnique({
    where: { recommendation_user_unique: { recommendationId, userId } },
  });

  let up = 0, down = 0; // deltas
  let userVote: string | null = voteType as string;
  if (!existing) {
    await prisma.recommendationVote.create({ data: { recommendationId, userId, type: voteType as string } });
    voteType === 'UPVOTE' ? (up = 1) : (down = 1);
  } else if (existing.type === voteType) {
    await prisma.recommendationVote.delete({ where: { id: existing.id } });
    voteType === 'UPVOTE' ? (up = -1) : (down = -1);
    userVote = null;
  } else {
    await prisma.recommendationVote.update({ where: { id: existing.id }, data: { type: voteType as string } });
    if (voteType === 'UPVOTE') { up = 1; down = -1; } else { up = -1; down = 1; }
  }

  const updated = await prisma.recommendation.update({
    where: { id: recommendationId },
    data: { upvotes: { increment: up }, downvotes: { increment: down } },
    select: { upvotes: true, downvotes: true },
  });
  const res = NextResponse.json({ upvotes: updated.upvotes, downvotes: updated.downvotes, userVote });
  if (isNew) attachUserCookie(res, userId);
  return res;
}
