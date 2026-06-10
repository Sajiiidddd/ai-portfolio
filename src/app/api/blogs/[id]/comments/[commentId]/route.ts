// src/app/api/blogs/[id]/comments/[commentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';
import { rateLimit, ipOf } from '@/lib/ratelimit';

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await context.params;
  const { userId } = await getCurrentUserId();

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment || comment.userId !== userId) {
    return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ message: 'Comment deleted' });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await context.params;
  const { content, author } = await req.json();
  if (!(await rateLimit(`cp:${ipOf(req)}`, 10, 60_000))) {
    return NextResponse.json({ error: 'Too many edits — slow down.' }, { status: 429 });
  }
  if (typeof content !== 'string' || content.trim().length === 0 || content.length > 2000) {
    return NextResponse.json({ error: 'Invalid content (1–2000 chars).' }, { status: 400 });
  }
  if (author != null && (typeof author !== 'string' || author.length > 60)) {
    return NextResponse.json({ error: 'Name too long (max 60 chars).' }, { status: 400 });
  }
  const { userId } = await getCurrentUserId();

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment || comment.userId !== userId) {
    return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 403 });
  }

  if (author?.trim()) {
    await prisma.user.update({
      where: { id: userId },
      data: { name: author.trim() },
    });
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
  });

  return NextResponse.json(updated);
}
