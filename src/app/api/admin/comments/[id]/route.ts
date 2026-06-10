import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { isAdminReq } from '@/lib/admin';

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdminReq(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const { hidden } = (await req.json().catch(() => ({}))) as { hidden?: boolean };
  const c = await prisma.comment.update({
    where: { id }, data: { hidden: !!hidden },
    select: { id: true, hidden: true, blog: { select: { slug: true } } },
  });
  revalidatePath(`/blogs/${c.blog.slug}`);
  return NextResponse.json({ id: c.id, hidden: c.hidden });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdminReq(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const c = await prisma.comment.findUnique({ where: { id }, select: { blog: { select: { slug: true } } } });
  await prisma.comment.delete({ where: { id } }).catch(() => {});
  if (c?.blog.slug) revalidatePath(`/blogs/${c.blog.slug}`);
  return NextResponse.json({ ok: true });
}
