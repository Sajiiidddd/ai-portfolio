'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import CodeBootScreen from '@/components/MinimalLoader';
import InteractiveBackground from '@/components/InteractiveBackground';
import FooterNav from '@/components/FooterNav';
import ScrollReveal from '@/components/ScrollReveal';

interface Blog {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  slug: string;
  tags: string[];
  readTime: number | null;
  createdAt: string;
}

// ─── Shared easing ────────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const;

// ─── Featured Card (first post, full-width) ───────────────────────────────────
function FeaturedCard({ blog }: { blog: Blog }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease }}
    >
      <Link href={`/blogs/${blog.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/20 transition-colors duration-500">
          {/* Image */}
          {blog.image && (
            <div className="relative w-full aspect-[21/9] overflow-hidden">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 90vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* Content overlaid on image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                {blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {blog.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-white/60 backdrop-blur-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors duration-300 leading-snug max-w-2xl">
                  {blog.title}
                </h2>
                {blog.description && (
                  <ScrollReveal
                    baseOpacity={0.1}
                    enableBlur
                    baseRotation={2}
                    blurStrength={3}
                    containerClassName="mt-2 max-w-xl"
                    textClassName="text-white/50 text-sm sm:text-base leading-relaxed line-clamp-2"
                  >
                    {blog.description}
                  </ScrollReveal>
                )}
                <div className="flex items-center gap-3 mt-4 text-white/30 text-xs">
                  <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  {blog.readTime && (
                    <><span className="opacity-50">·</span><span>{blog.readTime} min read</span></>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No-image fallback */}
          {!blog.image && (
            <div className="p-8 sm:p-10">
              {blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {blog.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-white/10 text-white/40">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors duration-300 max-w-2xl">
                {blog.title}
              </h2>
              {blog.description && (
                <ScrollReveal
                  baseOpacity={0.1}
                  enableBlur
                  baseRotation={2}
                  blurStrength={3}
                  containerClassName="mt-3 max-w-xl"
                  textClassName="text-white/50 text-base leading-relaxed"
                >
                  {blog.description}
                </ScrollReveal>
              )}
              <div className="flex items-center gap-3 mt-6 text-white/30 text-xs">
                <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                {blog.readTime && (
                  <><span className="opacity-50">·</span><span>{blog.readTime} min read</span></>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Regular Card ─────────────────────────────────────────────────────────────
function BlogCard({ blog, index }: { blog: Blog; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 2) * 0.07, ease }}
      className="h-full"
    >
      <Link href={`/blogs/${blog.slug}`} className="group flex flex-col h-full">
        <div className="flex flex-col h-full overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.04] transition-all duration-400">
          {/* Image */}
          <div className="relative w-full aspect-[16/9] overflow-hidden shrink-0 bg-white/[0.03]">
            {blog.image ? (
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover transition-transform duration-600 group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/[0.06] text-6xl font-black tracking-tighter select-none">
                  {blog.title.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>

          {/* Body */}
          <div className="flex flex-col flex-1 p-5">
            {blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {blog.tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full border border-white/[0.08] text-white/35">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h2 className="text-white/80 font-semibold text-base leading-snug group-hover:text-white/95 transition-colors duration-300 line-clamp-2 mb-2">
              {blog.title}
            </h2>

            {blog.description && (
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur
                baseRotation={1}
                blurStrength={2}
                containerClassName="flex-1 mb-4"
                textClassName="text-white/38 text-sm leading-relaxed line-clamp-2"
              >
                {blog.description}
              </ScrollReveal>
            )}

            <div className="flex items-center gap-2.5 text-white/25 text-[11px] mt-auto pt-2 border-t border-white/[0.05]">
              <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              {blog.readTime && (
                <><span>·</span><span>{blog.readTime} min</span></>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BlogsClient({ blogs }: { blogs: Blog[] }) {
  const [booting, setBooting] = useState(() =>
    typeof window !== 'undefined' ? !sessionStorage.getItem('hasBootedBlogs') : true
  );
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    if (booting) sessionStorage.setItem('hasBootedBlogs', 'true');
  }, [booting]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => b.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [blogs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      const matchesTag = !activeTag || b.tags.includes(activeTag);
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        (b.description?.toLowerCase().includes(q) ?? false) ||
        b.tags.some((t) => t.toLowerCase().includes(q));
      return matchesTag && matchesSearch;
    });
  }, [blogs, search, activeTag]);

  const isFiltering = Boolean(search || activeTag);
  const featured = !isFiltering && filtered.length > 0 ? filtered[0] : null;
  const rest = !isFiltering && filtered.length > 0 ? filtered.slice(1) : filtered;

  return (
    <main className="relative w-full min-h-screen bg-black text-white overflow-x-hidden">
      <InteractiveBackground />
      {booting && <CodeBootScreen onFinish={() => setBooting(false)} />}

      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-8 pt-20 pb-36">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="mb-10"
        >
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-white/25 text-[11px] font-semibold uppercase tracking-[0.2em] mb-1.5">Writing</p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white/90 leading-none">
                Blogs
              </h1>
            </div>
            <span className="text-white/20 text-sm tabular-nums">
              {blogs.length} post{blogs.length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>

        {/* ── Search + Tag filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease }}
          className="mb-10 space-y-4"
        >
          {/* Search */}
          <div className="relative max-w-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="w-full pl-6 pr-6 pb-1.5 pt-1 bg-transparent border-b border-white/10 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-white/30 transition-colors duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </button>
            )}
          </div>

          {/* Tag pills */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {['All', ...allTags].map((tag) => {
                const isActive = tag === 'All' ? activeTag === null : activeTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag === 'All' ? null : (activeTag === tag ? null : tag))}
                    className={`text-[11px] font-medium px-3 py-1 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-white/10 text-white/80 border border-white/20'
                        : 'text-white/35 border border-white/[0.07] hover:text-white/55 hover:border-white/15'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-32 gap-3"
            >
              <p className="text-white/20 text-base">No posts found</p>
              <button
                onClick={() => { setSearch(''); setActiveTag(null); }}
                className="text-xs text-white/25 hover:text-white/50 underline underline-offset-4 transition"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {/* Featured post */}
              {featured && (
                <div className="mb-8">
                  <FeaturedCard blog={featured} />
                </div>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rest.map((blog, i) => (
                    <BlogCard key={blog.id} blog={blog} index={i} />
                  ))}
                </div>
              )}

              {/* Results hint */}
              {isFiltering && (
                <p className="mt-8 text-center text-[11px] text-white/20">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                  {activeTag ? ` in "${activeTag}"` : ''}
                  {search ? ` for "${search}"` : ''}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30">
        <FooterNav />
      </div>
    </main>
  );
}
