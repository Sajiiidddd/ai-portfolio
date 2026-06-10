import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminReq } from '@/lib/admin';

export async function GET(req: NextRequest) {
  if (!isAdminReq(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const qs = await prisma.agentQuery.findMany({
    orderBy: { createdAt: 'desc' }, take: 300,
    select: { id: true, question: true, answer: true, source: true, createdAt: true },
  });
  return NextResponse.json(qs);
}
