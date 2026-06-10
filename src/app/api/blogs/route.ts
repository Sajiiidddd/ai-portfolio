import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        image: true,
        tags: true,
        readTime: true,
        createdAt: true,
      },
    });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('[GET /api/blogs]', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}
