import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminReq } from '@/lib/admin';

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdminReq(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  await prisma.subscriber.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
