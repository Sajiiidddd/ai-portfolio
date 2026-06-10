import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
import { prisma } from '@/lib/prisma';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Sajid Tamboli — writing';

const PALETTE = ['#9ec8ff', '#5dcaa5', '#ff9e6e', '#c9a9ff', '#ed93b1', '#ffe08a'];

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let blog: { title: string; tags: string[]; readTime: number | null } | null = null;
  try {
    blog = await prisma.blog.findUnique({ where: { slug }, select: { title: true, tags: true, readTime: true } });
  } catch {}
  const title = blog?.title ?? 'Writing';
  const tag = blog?.tags?.[0] ?? 'Field notes';
  const read = blog?.readTime ? `${blog.readTime} min read` : '';
  const accent = PALETTE[[...slug].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
  return ogCard({ eyebrow: `Writing · ${tag}`, title, footerLeft: 'Sajid Tamboli · AI / ML Engineer', footerRight: read, accent });
}
