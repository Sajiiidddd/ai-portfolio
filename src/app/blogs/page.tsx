import { prisma } from '@/lib/prisma';
import WritingClient from '@/components/WritingClient';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export const metadata = {
  title: 'Writing',
  description: 'Field notes, build logs, and lessons learned — on MCP, RAG, training runs, and shipping ML to production.',
  alternates: { canonical: '/blogs', types: { 'application/rss+xml': [{ url: '/feed.xml', title: 'Sajid Tamboli — Writing' }] } },
  openGraph: { title: 'Writing · Sajid Tamboli', description: 'Field notes, build logs, and lessons learned.', type: 'website', url: '/blogs' },
};

type BlogRow = {
  id: string; title: string; slug: string; description: string | null;
  image: string | null; tags: string[]; readTime: number | null; createdAt: Date;
};

export default async function BlogsPage() {
  // Resilient fetch: if the database is unreachable (e.g. missing DATABASE_URL
  // locally), render an empty list instead of crashing the page.
  let blogs: BlogRow[] = [];
  try {
    blogs = await prisma.blog.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        image: true,
        tags: true,
        readTime: true,
        createdAt: true,
      },
    });
  } catch (e) {
    console.error('[/blogs] database unavailable:', e);
  }

  // Serialize dates for client component
  const serialized = blogs.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
  }));

  return <WritingClient blogs={serialized} />;
}
