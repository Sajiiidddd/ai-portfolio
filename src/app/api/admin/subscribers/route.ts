import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminReq } from '@/lib/admin';

export async function GET(req: NextRequest) {
  if (!isAdminReq(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const subs = await prisma.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, confirmed: true, createdAt: true, confirmedAt: true },
  });
  return NextResponse.json(subs);
}
