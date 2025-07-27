import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const getCurrentUserId = () => 'anonymous-temp'; // Replace later

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const { params } = await Promise.resolve(context);
const blogId = params.id;
  const { author, content } = await req.json();
  const userId = getCurrentUserId();

  if (!author || !content) {
    return NextResponse.json({ error: 'Name and comment required' }, { status: 400 });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        blogId,
        author,
        content,
        userId,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('[POST /comments]', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

export async function GET(_: NextRequest, context: { params: { id: string } }) {
  const { params } = await Promise.resolve(context);
  const blogId = params.id;

  try {
    const comments = await prisma.comment.findMany({
      where: { blogId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error('[GET /comments]', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}




