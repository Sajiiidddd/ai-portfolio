import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { recommendationId, voteType, userId } = await req.json();

    if (!recommendationId || !voteType || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already voted
    const existingVote = await prisma.recommendationVote.findUnique({
  where: {
    recommendation_user_unique: {
      recommendationId,
      userId,
    },
  },
});

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted' }, { status: 409 });
    }

    // Create vote entry
    await prisma.recommendationVote.create({
      data: {
        recommendationId,
        userId,
        type: voteType,
      },
    });

    // Update vote count
    const updateData =
      voteType === 'UPVOTE'
        ? { upvotes: { increment: 1 } }
        : { downvotes: { increment: 1 } };

    const updated = await prisma.recommendation.update({
      where: { id: recommendationId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('POST /recommendation/vote error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
