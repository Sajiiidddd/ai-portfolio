'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CodeBootScreen from '@/components/MinimalLoader';
import InteractiveBackground from '@/components/InteractiveBackground';
import FooterNav from '@/components/FooterNav';
import ReactMarkdown from 'react-markdown';

// 🎨 Centralized color tokens
const overlayTextColor = 'text-white/50';
const titleTextColor = 'text-white/80';
const dateTextColor = 'text-white/40';
const descTextColor = 'text-white/60';
const accentColor = 'text-white/80';

interface Blog {
  id: string;
  title: string;
  description: string;
  image: string;
  slug: string;
  createdAt: string;
  hoverPair?: [string, string];
}

function BlogsOverlay({ activeIdx, blogs }: { activeIdx: number; blogs: Blog[] }) {
  const [pair, setPair] = useState(['READ', 'BLOG']);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const newPair = blogs[activeIdx]?.hoverPair || ['READ', 'BLOG'];
    setPair(newPair);
  }, [activeIdx, blogs]);

  return (
    <div
      className="fixed bottom-20 left-0 right-0 z-40 flex justify-center pointer-events-auto w-screen max-w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="relative flex flex-col items-center justify-center w-full max-w-full"
      >
        <motion.div animate={{ opacity: hovered ? 0 : 1 }} className="transition-opacity duration-500">
          <h1 className="text-[10vw] font-extrabold tracking-tighter leading-none text-center text-white">
            BLOGS
          </h1>
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-row items-center justify-center pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
        >
          <motion.div
            className="flex flex-row items-center justify-center"
            animate={{ gap: hovered ? '6vw' : '0vw' }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          >
            <motion.span
              className={`text-[7vw] font-extrabold tracking-tighter leading-none whitespace-nowrap ${overlayTextColor}`}
              animate={{ x: hovered ? '-3vw' : 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            >
              {pair[0]}
            </motion.span>
            <motion.span
              className={`text-[7vw] font-extrabold tracking-tighter leading-none whitespace-nowrap ${overlayTextColor}`}
              animate={{ x: hovered ? '3vw' : 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            >
              {pair[1]}
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function BlogsPage() {
  // Change 1: sessionStorage flagging for one-time boot screen per session (scope: BLOGS).
  const [booting, setBooting] = useState(() => {
    if (typeof window !== 'undefined') {
      const hasBootedInSession = sessionStorage.getItem('hasBootedBlogs');
      if (hasBootedInSession) return false;
    }
    return true;
  });

  // Change 2: Similar to ProjectsPage, set sessionStorage flag once boot screen runs.
  useEffect(() => {
    if (booting) {
      sessionStorage.setItem('hasBootedBlogs', 'true');
    }
  }, [booting]);

  // Unchanged logic below
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const blogRefs = useRef<(HTMLDivElement | null)[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data: Blog[]) => {
        const blogsWithHover = data.map((b) => ({
          ...b,
          hoverPair: b.hoverPair ?? generateFallbackPair(b.title),
        }));
        setBlogs(blogsWithHover);
      });
  }, []);

  const observe = useCallback((elements: HTMLDivElement[]) => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = elements.findIndex((el) => el === entry.target);
          if (entry.isIntersecting) setActiveIdx(idx);
        });
      },
      {
        root: null,
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0.3,
      }
    );

    elements.forEach((el) => {
      if (el) observer.current?.observe(el);
    });
  }, []);

  useEffect(() => {
    const elements = blogRefs.current.filter((ref): ref is HTMLDivElement => ref !== null);
    observe(elements);
    return () => observer.current?.disconnect();
  }, [observe, blogs]);

  return (
    <main className="relative w-full min-h-screen bg-black text-white overflow-x-hidden">
      <InteractiveBackground />
      {/* Booting logic unchanged, just uses new sessionStorage-aware flag now */}
      {booting && <CodeBootScreen onFinish={() => setBooting(false)} />}
      <BlogsOverlay activeIdx={activeIdx} blogs={blogs} />

      {/* Timeline Dots */}
      <div className="fixed left-10 top-1/2 transform -translate-y-1/2 flex flex-col items-center w-12 z-50 pointer-events-auto">
        {blogs.map((_, idx) => (
          <motion.div
            key={idx}
            className={`h-6 w-6 rounded-full mb-8 cursor-pointer ${
              idx === activeIdx ? `${accentColor}` : 'border-white/30'
            } border-2`}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={idx === activeIdx ? { scale: 1.2, opacity: 1 } : { scale: 0.8, opacity: 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => {
              setActiveIdx(idx);
              blogRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }}
          />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-auto">
        <FooterNav />
      </div>

      <div className="relative w-full max-w-6xl mx-auto pt-32 pb-40 flex">
        <div className="flex-1 flex flex-col gap-32 ml-20">
          {blogs.map((blog, idx) => (
            <motion.div
              key={blog.id}
              ref={(el) => (blogRefs.current[idx] = el)}
              initial={{ opacity: 0, y: 60, scale: 0.98 }}
              animate={idx === activeIdx ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.5 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 60, damping: 18 }}
              className="flex flex-col md:flex-row items-center gap-10 cursor-pointer"
            >
              <Link href={`/blogs/${blog.slug}`} className="flex items-center gap-10 w-full">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  width={400}
                  height={300}
                  className="object-cover shadow-lg rounded-lg"
                />
                <div className="flex-1 text-left">
                  <div className={`text-sm font-semibold ${dateTextColor} mb-1`}>
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </div>
                  <div className={`text-2xl font-bold ${titleTextColor} mb-2`}>
                    {blog.title}
                  </div>
                  <div className={`text-base ${descTextColor}`}>{blog.description}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

// Utility: fallback hover pair generator
function generateFallbackPair(title: string): [string, string] {
  const words = title.toUpperCase().split(' ');
  if (words.length >= 2) return [words[0], words[1]];
  return [title.slice(0, Math.floor(title.length / 2)), title.slice(Math.floor(title.length / 2))];
}





