'use client';

import { useEffect, useState } from 'react';

export default function ReadingHUD({ readTime }: { readTime?: number | null }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? Math.min(Math.round((y / h) * 100), 100) : 0);
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  const minLeft = readTime ? Math.max(0, Math.ceil(readTime * (1 - pct / 100))) : null;

  return (
    <>
      <div className="as-progress"><i style={{ width: `${pct}%` }} /></div>
      <div className="as-hud" aria-hidden="true">
        <span className="bar"><i style={{ width: `${pct}%` }} /></span>
        {pct >= 99
          ? <span>Transmission complete</span>
          : <span>Reading {String(pct).padStart(2, '0')}%{minLeft !== null ? ` · ~${minLeft} min left` : ''}</span>}
      </div>
    </>
  );
}
