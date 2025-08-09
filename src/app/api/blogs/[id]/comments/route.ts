// src/app/api/blogs/[id]/comments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

//GET
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const comments = await prisma.comment.findMany({
  where: { blogId: id },
  orderBy: { createdAt: "desc" },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        image: true,
      },
    },
  },
});


    // Normalize user names to "Anonymous" if empty or null
    const commentsWithAnonNames = comments.map((c) => ({
      ...c,
      user: {
        ...c.user,
        name: c.user?.name && c.user.name.trim() !== "" ? c.user.name : "Anonymous",
      },
    }));

    return NextResponse.json(commentsWithAnonNames);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}


// POST: Create a new comment for a blog
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { content, author } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const userId = await getCurrentUserId();

    // Always upsert user and update name if provided, else keep previous name
    await prisma.user.upsert({
      where: { id: userId },
      update: author && author.trim() !== "" ? { name: author.trim() } : {},
      create: {
        id: userId,
        name: author && author.trim() !== "" ? author.trim() : null,
        email: `${userId}@local.fake`,
      },
    });

    const newComment = await prisma.comment.create({
      data: {
        content,
        blogId: id,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Return userId in the response for frontend ownership checks
    return NextResponse.json(
      { ...newComment, userId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}


