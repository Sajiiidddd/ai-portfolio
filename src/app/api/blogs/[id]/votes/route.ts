import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, VoteType } from '@prisma/client';

const prisma = new PrismaClient();

interface Params {
  id: string;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: blogId } = await context.params;
  const { voteType } = await req.json(); // "UPVOTE" or "DOWNVOTE"

  if (!blogId || !["UPVOTE", "DOWNVOTE"].includes(voteType)) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
  }

  // === Get or create user ID from cookie ===
  let userId: string;
  let setCookie = false;
  const cookie = req.cookies.get("user_id");

  if (cookie?.value) {
    userId = cookie.value;
  } else {
    userId = crypto.randomUUID();
    setCookie = true;
  }

  // Ensure user exists in DB
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@local.fake`,
      name: "Anonymous",
    },
  });

  // Get existing vote if any
  const existingVote = await prisma.vote.findUnique({
  where: {
    userId_blogId: { userId, blogId },
  },
});
  let message = "";

  // 1. Create new vote
  if (!existingVote) {
    await prisma.vote.create({
      data: { blogId, userId, type: voteType as VoteType },
    });
    message = "Vote created.";
  }
  // 2. Toggle off same vote (unvote)
  else if (existingVote.type === voteType) {
    await prisma.vote.delete({
      where: { id: existingVote.id },
    });
    message = "Vote deleted.";
  }
  // 3. Switch vote
  else {
    await prisma.vote.update({
      where: { id: existingVote.id },
      data: { type: voteType as VoteType },
    });
    message = "Vote updated.";
  }

  // Return updated counts
  const [upvotes, downvotes] = await Promise.all([
    prisma.vote.count({ where: { blogId, type: "UPVOTE" } }),
    prisma.vote.count({ where: { blogId, type: "DOWNVOTE" } }),
  ]);

  const response = NextResponse.json({
    message,
    upvotes,
    downvotes,
  });

  if (setCookie) {
    response.cookies.set("user_id", userId, {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
  }

  return response;
}

