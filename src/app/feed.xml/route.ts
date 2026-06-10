import { prisma } from '@/lib/prisma';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';

export const revalidate = 3600;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export async function GET() {
  let posts: { slug: string; title: string; description: string | null; createdAt: Date }[] = [];
  try {
    posts = await prisma.blog.findMany({
      where: { published: true },
      select: { slug: true, title: true, description: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch {}

  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE_URL}/blogs/${p.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blogs/${p.slug}</guid>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
      ${p.description ? `<description>${esc(p.description)}</description>` : ''}
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)} — Writing</title>
    <link>${SITE_URL}/blogs</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${esc(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
