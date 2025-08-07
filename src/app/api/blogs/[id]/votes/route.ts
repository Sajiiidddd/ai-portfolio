import { prisma } from "@/lib/prisma";
import { getOrCreateUserId } from "@/lib/getUserId";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: {
    id: string; // blogId from the route
  };
};

export async function POST(req: NextRequest, { params }: Params) {
  const blogId = params.id;
  const { voteType } = await req.json(); // voteType: 'UPVOTE' | 'DOWNVOTE'
  const userId = await getOrCreateUserId();

  const existingVote = await prisma.vote.findUnique({
    where: {
      blogId_userId: {
        blogId,
        userId,
      },
    },
  });

  if (!existingVote) {
    await prisma.vote.create({
      data: {
        blogId,
        userId,
        type: voteType,
      },
    });
  } else if (existingVote.type !== voteType) {
    await prisma.vote.update({
      where: {
        blogId_userId: {
          blogId,
          userId,
        },
      },
      data: {
        type: voteType,
      },
    });
  } else {
    await prisma.vote.delete({
      where: {
        blogId_userId: {
          blogId,
          userId,
        },
      },
    });
  }

  return NextResponse.json({ success: true });
}






