'use client';

import { useEffect, useRef } from 'react';

/**
 * Progressive scroll-reveal for server-rendered article content.
 * Initial styles are applied via JS (not CSS), so no-JS visitors and
 * crawlers always see the full content.
 */
export default function ScrollProse({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = ref.current;
    const prose = root?.firstElementChild;
    if (!prose) return;
    const els = Array.from(prose.children) as HTMLElement[];
    els.forEach((el) => el.classList.add('sp-i'));
    let seq = 0;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.style.transitionDelay = `${Math.min(seq++ % 5, 4) * 50}ms`;
          el.classList.add('sp-in');
          io.unobserve(el);
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}
