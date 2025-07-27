import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VoteType } from '@prisma/client';

const getCurrentUserId = () => 'anonymous-temp'; // Replace with auth logic later

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const blogId = context.params.id;
  const { type } = await req.json();
  const userId = getCurrentUserId();

  if (!['upvote', 'downvote'].includes(type)) {
    return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
  }

  try {
    const updatedVote = await prisma.vote.upsert({
      where: {
        blogId_userId: { blogId, userId },
      },
      update: {
        type: type === 'upvote' ? VoteType.UPVOTE : VoteType.DOWNVOTE,
      },
      create: {
        blogId,
        userId,
        type: type === 'upvote' ? VoteType.UPVOTE : VoteType.DOWNVOTE,
      },
    });

    const votes = await prisma.vote.findMany({ where: { blogId } });
    const upvotes = votes.filter((v) => v.type === 'UPVOTE').length;
    const downvotes = votes.filter((v) => v.type === 'DOWNVOTE').length;

    return NextResponse.json({ upvotes, downvotes });
  } catch (error) {
    console.error('[POST /votes]', error);
    return NextResponse.json({ error: 'Failed to register vote' }, { status: 500 });
  }
}




