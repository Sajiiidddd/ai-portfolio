import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ['', '/projects', '/blogs', '/toolkit', '/contact', '/certifications'].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date(),
    changeFrequency: (p === '' || p === '/blogs' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
    priority: p === '' ? 1 : 0.7,
  }));

  let posts: { slug: string; updatedAt: Date }[] = [];
  try {
    posts = await prisma.blog.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch {}

  const blogRoutes = posts.map((b) => ({
    url: `${SITE_URL}/blogs/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...routes, ...blogRoutes];
}
