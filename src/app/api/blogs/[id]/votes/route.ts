import { NextRequest, NextResponse } from 'next/server';
import { VoteType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

import { fromRequest as getUserIdFromCookie, attachUserCookie as setCookieOnResponse } from '@/lib/identity';
import { rateLimit, ipOf } from '@/lib/ratelimit';

// GET — return current vote counts + the requesting user's vote
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: blogId } = await context.params;
  const { userId, isNew } = getUserIdFromCookie(req);

  const [grouped, existingVote] = await Promise.all([
    prisma.vote.groupBy({ by: ['type'], where: { blogId }, _count: { _all: true } }),
    prisma.vote.findUnique({ where: { userId_blogId: { userId, blogId } } }),
  ]);
  const upvotes = grouped.find((g) => g.type === 'UPVOTE')?._count._all ?? 0;
  const downvotes = grouped.find((g) => g.type === 'DOWNVOTE')?._count._all ?? 0;

  const response = NextResponse.json({
    upvotes,
    downvotes,
    voteType: existingVote?.type ?? null,
  });

  if (isNew) setCookieOnResponse(response, userId);
  return response;
}

// POST — cast / toggle / remove a vote, optionally capturing the voter's name
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: blogId } = await context.params;
  const { voteType } = await req.json();

  if (!(await rateLimit(`v:${ipOf(req)}`, 30, 60_000))) {
    return NextResponse.json({ error: 'Too many votes — slow down.' }, { status: 429 });
  }

  if (!blogId || !['UPVOTE', 'DOWNVOTE'].includes(voteType)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { userId, isNew } = getUserIdFromCookie(req);

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: `${userId}@local.fake`, name: 'Anonymous' },
  });

  const existingVote = await prisma.vote.findUnique({
    where: { userId_blogId: { userId, blogId } },
  });

  let message = '';
  let resultingType: VoteType | null = null;
  if (!existingVote) {
    await prisma.vote.create({ data: { blogId, userId, type: voteType as VoteType } });
    message = 'Vote created.';
    resultingType = voteType as VoteType;
  } else if (existingVote.type === voteType) {
    await prisma.vote.delete({ where: { id: existingVote.id } });
    message = 'Vote removed.';
    resultingType = null;
  } else {
    await prisma.vote.update({ where: { id: existingVote.id }, data: { type: voteType as VoteType } });
    message = 'Vote updated.';
    resultingType = voteType as VoteType;
  }

  const grouped = await prisma.vote.groupBy({ by: ['type'], where: { blogId }, _count: { _all: true } });
  const upvotes = grouped.find((g) => g.type === 'UPVOTE')?._count._all ?? 0;
  const downvotes = grouped.find((g) => g.type === 'DOWNVOTE')?._count._all ?? 0;

  const response = NextResponse.json({
    message,
    upvotes,
    downvotes,
    voteType: resultingType,
  });

  if (isNew) setCookieOnResponse(response, userId);
  return response;
}
