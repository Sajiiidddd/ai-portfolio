// src/app/blogs/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import ArticleShell from '@/components/ArticleShell';
import BlogVotes from '@/components/BlogVotes';
import BlogComments from '@/components/BlogComments';
import ReadingHUD from '@/components/ReadingHUD';
import ScrollProse from '@/components/ScrollProse';
import CopyLink from '@/components/CopyLink';
import BlogDescriptionReveal from '@/components/BlogDescriptionReveal';
import BlogMotif from '@/components/BlogMotif';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import type { ReactNode } from 'react';

export const revalidate = 60; // ISR: article shell is cached; comments/votes hydrate client-side

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps) {
  const { slug } = await params;
  let blog = null;
  try {
    blog = await prisma.blog.findUnique({
      where: { slug },
      select: { title: true, description: true, createdAt: true, updatedAt: true },
    });
  } catch {}
  if (!blog) return {};
  const url = `${SITE_URL}/blogs/${slug}`;
  const description = blog.description ?? undefined;
  return {
    title: blog.title,
    description,
    alternates: { canonical: `/blogs/${slug}` },
    openGraph: {
      type: 'article', url, title: blog.title, description, siteName: SITE_NAME,
      publishedTime: blog.createdAt?.toISOString(), modifiedTime: blog.updatedAt?.toISOString(), authors: [SITE_NAME],
    },
    twitter: { card: 'summary_large_image', title: blog.title, description },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;

  let blog = null;
  try {
    blog = await prisma.blog.findUnique({ where: { slug } });
  } catch (e) {
    console.error('[/blogs/[slug]] database unavailable:', e);
  }

  if (!blog || !blog.published) return notFound();

  // ── Contents (Ship schedule-style) — parsed from the markdown headings ──
  const slugifyHeading = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const cleanHeading = (t: string) => t.replace(/[*_`]/g, '').trim();
  const headings = Array.from(blog.content.matchAll(/^(#{2,3})\s+(.+)$/gm)).map((m) => {
    const text = cleanHeading(m[2]);
    return { depth: m[1].length, text, id: slugifyHeading(text) };
  });
  let secNo = 0;
  const toc = headings.map((h) => ({ ...h, no: h.depth === 2 ? String(++secNo).padStart(2, '0') : '··' }));

  const textOf = (n: ReactNode): string => {
    if (typeof n === 'string' || typeof n === 'number') return String(n);
    if (Array.isArray(n)) return n.map(textOf).join('');
    if (n && typeof n === 'object' && 'props' in n) {
      return textOf((n as { props?: { children?: ReactNode } }).props?.children);
    }
    return '';
  };
  const mdComponents: Components = {
    h2: ({ children }) => <h2 id={slugifyHeading(cleanHeading(textOf(children as ReactNode)))}>{children}</h2>,
    h3: ({ children }) => <h3 id={slugifyHeading(cleanHeading(textOf(children as ReactNode)))}>{children}</h3>,
    table: ({ children }) => (<div className="as-tablewrap"><table>{children}</table></div>),
  };

  // Adjacent posts for end-of-article navigation (best-effort).
  let prev: { title: string; slug: string } | null = null;
  let next: { title: string; slug: string } | null = null;
  try {
    [prev, next] = await Promise.all([
      prisma.blog.findFirst({ where: { published: true, createdAt: { lt: blog.createdAt } }, orderBy: { createdAt: 'desc' }, select: { title: true, slug: true } }),
      prisma.blog.findFirst({ where: { published: true, createdAt: { gt: blog.createdAt } }, orderBy: { createdAt: 'asc' }, select: { title: true, slug: true } }),
    ]);
  } catch {}

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.description ?? undefined,
    datePublished: blog.createdAt.toISOString(),
    dateModified: blog.updatedAt.toISOString(),
    keywords: blog.tags.join(', '),
    author: { '@type': 'Person', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blogs/${slug}` },
    url: `${SITE_URL}/blogs/${slug}`,
  };

  return (
    <ArticleShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <ReadingHUD readTime={blog.readTime} />

      <div className="as-col">
        <a href="/blogs" className="as-back">← All posts</a>

        <article>
          {blog.tags.length > 0 && (
            <div className="as-chips">
              {blog.tags.map((tag) => (
                <span key={tag} className="as-chip">{tag}</span>
              ))}
            </div>
          )}

          <h1 className="as-title">{blog.title}</h1>

          <div className="as-meta">
            <time dateTime={blog.createdAt.toISOString()}>
              <b>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</b>
            </time>
            {blog.readTime && (<><span>·</span><span>{blog.readTime} min read</span></>)}
            <span className="ml-auto"><CopyLink /></span>
          </div>

          {blog.description && <BlogDescriptionReveal description={blog.description} />}

          <div className="as-hero as-hero--motif">
            <BlogMotif slug={blog.slug} tags={blog.tags} />
          </div>

          {toc.length >= 2 && (
            <nav className="as-toc" aria-label="Table of contents">
              <div className="as-tochead">
                <span className="tab">Contents</span>
                <span className="count">{String(toc.length).padStart(2, '0')} sections</span>
              </div>
              {toc.map((h, i) => (
                <a key={h.id + i} href={`#${h.id}`} className={`as-tocrow ${h.depth === 3 ? 'sub' : ''}`}>
                  <span className="n">{h.no}</span>
                  <span className="t">{h.text}</span>
                  <span className="ar">↓</span>
                </a>
              ))}
            </nav>
          )}

          <ScrollProse>
          <div className="
            prose prose-invert max-w-none
            prose-p:text-[#c9c9bf] prose-p:leading-[1.85] prose-p:text-[15px]
            prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[#ece9e1]
            prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3
            prose-h3:text-lg prose-h3:mt-7 prose-h3:mb-2
            prose-a:text-[#ece9e1] prose-a:underline prose-a:underline-offset-2 prose-a:decoration-white/25 hover:prose-a:decoration-white/60
            prose-strong:text-[#ece9e1] prose-strong:font-semibold
            prose-em:text-[#a7a79e]
            prose-code:text-[#d2d2c8] prose-code:bg-white/[0.06] prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:font-normal
            prose-pre:bg-[#0c0c0c] prose-pre:border prose-pre:border-white/[0.1] prose-pre:rounded-lg prose-pre:text-sm
            prose-blockquote:border-l-2 prose-blockquote:border-white/20 prose-blockquote:pl-4 prose-blockquote:text-[#a7a79e] prose-blockquote:not-italic prose-blockquote:font-normal
            prose-ul:text-[#bdbdb3] prose-ol:text-[#bdbdb3]
            prose-li:my-0.5
            prose-hr:border-white/[0.1]
            prose-img:rounded-lg prose-img:border prose-img:border-white/[0.1]
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {blog.content}
            </ReactMarkdown>
          </div>
          </ScrollProse>
        </article>

        <div className="as-divider">End of transmission</div>

        <div className="space-y-10">
          <BlogVotes blogId={blog.id} upvotes={0} downvotes={0} />
          <BlogComments blogId={blog.id} />
        </div>

        <div className="as-pn">
          {prev ? (
            <a href={`/blogs/${prev.slug}`} className="as-pncard"><span className="k">← Previous</span><span className="t">{prev.title}</span></a>
          ) : (
            <div className="as-pncard empty"><span className="k">← Previous</span><span className="t">—</span></div>
          )}
          {next ? (
            <a href={`/blogs/${next.slug}`} className="as-pncard next"><span className="k">Next →</span><span className="t">{next.title}</span></a>
          ) : (
            <div className="as-pncard empty next"><span className="k">Next →</span><span className="t">—</span></div>
          )}
        </div>
      </div>
    </ArticleShell>
  );
}
