import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { isAdminReq } from '@/lib/admin';

const slugify = (t: string) => t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const estimateReadTime = (content: string) => Math.max(1, Math.round(content.trim().split(/\s+/).filter(Boolean).length / 200));

// PATCH — update a post
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdminReq(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const existing = await prisma.blog.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  if (b.title != null) data.title = String(b.title).trim();
  if (b.content != null) data.content = String(b.content);
  if (b.description !== undefined) data.description = b.description ? String(b.description) : null;
  if (b.tags !== undefined) data.tags = Array.isArray(b.tags) ? b.tags : String(b.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean);
  if (b.published !== undefined) data.published = b.published === true || b.published === 'true';
  if (b.readTime !== undefined && b.readTime !== '') data.readTime = Number(b.readTime);
  else if (b.content != null) data.readTime = estimateReadTime(String(b.content));

  if (b.slug != null) {
    const slug = slugify(String(b.slug) || String(b.title ?? existing.title));
    if (slug && slug !== existing.slug) {
      const clash = await prisma.blog.findUnique({ where: { slug } });
      if (clash && clash.id !== id) return NextResponse.json({ error: `Slug "${slug}" already exists.` }, { status: 409 });
      data.slug = slug;
    }
  }

  const post = await prisma.blog.update({ where: { id }, data });
  revalidatePath('/blogs');
  revalidatePath(`/blogs/${post.slug}`);
  if (existing.slug !== post.slug) revalidatePath(`/blogs/${existing.slug}`);
  revalidatePath('/sitemap.xml');
  return NextResponse.json(post);
}

// DELETE — remove a post (cascades comments/votes/likes)
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdminReq(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const existing = await prisma.blog.findUnique({ where: { id }, select: { slug: true } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.blog.delete({ where: { id } });
  revalidatePath('/blogs');
  revalidatePath(`/blogs/${existing.slug}`);
  revalidatePath('/sitemap.xml');
  return NextResponse.json({ ok: true });
}
