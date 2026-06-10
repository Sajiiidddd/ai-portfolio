import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { isAdminReq } from '@/lib/admin';

const slugify = (t: string) => t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const estimateReadTime = (content: string) => Math.max(1, Math.round(content.trim().split(/\s+/).filter(Boolean).length / 200));

// GET — list every post (incl. drafts) for the dashboard
export async function GET(req: NextRequest) {
  if (!isAdminReq(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const posts = await prisma.blog.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, published: true, tags: true, readTime: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json(posts);
}

// POST — create a post
export async function POST(req: NextRequest) {
  if (!isAdminReq(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const title = String(b.title ?? '').trim();
  const content = String(b.content ?? '');
  if (!title || !content.trim()) return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });

  const slug = slugify(String(b.slug ?? '') || title);
  if (!slug) return NextResponse.json({ error: 'Could not derive a slug.' }, { status: 400 });
  if (await prisma.blog.findUnique({ where: { slug } })) {
    return NextResponse.json({ error: `Slug "${slug}" already exists.` }, { status: 409 });
  }

  const tags = Array.isArray(b.tags) ? (b.tags as string[]) : String(b.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean);
  const readTime = b.readTime ? Number(b.readTime) : estimateReadTime(content);

  const post = await prisma.blog.create({
    data: {
      title, slug, content,
      description: b.description ? String(b.description) : null,
      tags, readTime,
      published: b.published === true || b.published === 'true',
    },
  });

  revalidatePath('/blogs');
  revalidatePath(`/blogs/${slug}`);
  revalidatePath('/sitemap.xml');
  return NextResponse.json(post, { status: 201 });
}
