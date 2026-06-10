import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fromRequest as getUserId } from '@/lib/identity';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { userId } = getUserId(req);
  const rec = await prisma.recommendation.findUnique({ where: { id }, select: { userId: true } });
  if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (rec.userId !== userId) return NextResponse.json({ error: 'Not yours' }, { status: 403 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  if (b.review !== undefined) {
    const r = String(b.review).trim();
    if (!r || r.length > 50) return NextResponse.json({ error: 'Review is required (max 50 chars).' }, { status: 400 });
    data.review = r;
  }
  // Allow swapping the pick itself (change the movie/song).
  if (b.title !== undefined) { const t = String(b.title).trim(); if (!t) return NextResponse.json({ error: 'Title required.' }, { status: 400 }); data.title = t; }
  if (b.externalId !== undefined) data.externalId = String(b.externalId);
  if (b.subtitle !== undefined) data.subtitle = b.subtitle ? String(b.subtitle) : null;
  if (b.imageUrl !== undefined) data.imageUrl = b.imageUrl ? String(b.imageUrl) : null;
  if (b.year !== undefined) data.year = b.year ? String(b.year) : null;
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  const updated = await prisma.recommendation.update({ where: { id }, data, select: { id: true, title: true, subtitle: true, imageUrl: true, year: true, review: true } });
  return NextResponse.json({ ok: true, ...updated });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { userId } = getUserId(req);
  const rec = await prisma.recommendation.findUnique({ where: { id }, select: { userId: true } });
  if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (rec.userId !== userId) return NextResponse.json({ error: 'Not yours' }, { status: 403 });
  await prisma.recommendation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
