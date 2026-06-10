import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminReq } from '@/lib/admin';

export async function GET(req: NextRequest) {
  if (!isAdminReq(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 300,
    select: {
      id: true, content: true, hidden: true, createdAt: true,
      user: { select: { name: true } },
      blog: { select: { title: true, slug: true } },
      _count: { select: { likes: true } },
    },
  });
  return NextResponse.json(comments);
}
