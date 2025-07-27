import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const getCurrentUserId = () => 'anonymous-temp';

export async function DELETE(
  _req: NextRequest,
  context: { params: { commentId: string } }
) {
  const commentId = context.params.commentId;
  const currentUserId = getCurrentUserId();

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment || comment.userId !== currentUserId) {
    return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ message: 'Comment deleted' });
}

export async function PATCH(
  req: NextRequest,
  context: { params: { commentId: string } }
) {
  const commentId = context.params.commentId;
  const { content } = await req.json();
  const currentUserId = getCurrentUserId();

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment || comment.userId !== currentUserId) {
    return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 403 });
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
  });

  return NextResponse.json(updated);
}



