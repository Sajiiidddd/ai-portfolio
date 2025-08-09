import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth"; // ✅

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await context.params;
  const currentUserId = await getCurrentUserId();

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment || comment.userId !== currentUserId) {
    return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ message: "Comment deleted" });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await context.params;
  const { content, author } = await req.json();  // include author here
  const currentUserId = await getCurrentUserId();

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment || comment.userId !== currentUserId) {
    return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });
  }

  // Update user name if author provided and non-empty
  if (author && author.trim() !== "") {
    await prisma.user.update({
      where: { id: currentUserId },
      data: { name: author.trim() },
    });
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
  });

  return NextResponse.json(updated);
}





