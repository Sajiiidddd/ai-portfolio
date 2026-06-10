'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface BlogVotesProps {
  blogId: string;
  upvotes: number;
  downvotes: number;
}

type Sel = 'up' | 'down' | null;

export default function BlogVotes({ blogId, upvotes: initUp, downvotes: initDown }: BlogVotesProps) {
  const [counts, setCounts] = useState({ up: initUp, down: initDown });
  const [selected, setSelected] = useState<Sel>(null);
  const busy = useRef(false);

  // Reconcile with the user's own vote state (non-blocking).
  useEffect(() => {
    fetch(`/api/blogs/${blogId}/votes`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.upvotes === 'number') setCounts({ up: d.upvotes, down: d.downvotes });
        if (d.voteType === 'UPVOTE') setSelected('up');
        else if (d.voteType === 'DOWNVOTE') setSelected('down');
      })
      .catch(() => {});
  }, [blogId]);

  // Optimistic: update the UI instantly, reconcile with the server in the
  // background, roll back if the request fails.
  const vote = async (type: 'up' | 'down') => {
    if (busy.current) return;
    busy.current = true;

    const prev = { counts: { ...counts }, selected };
    const c = { ...counts };
    let nextSel: Sel;
    if (selected === type) { nextSel = null; c[type] = Math.max(0, c[type] - 1); }
    else { nextSel = type; c[type] += 1; if (selected) c[selected] = Math.max(0, c[selected] - 1); }
    setCounts(c);
    setSelected(nextSel);

    try {
      const res = await fetch(`/api/blogs/${blogId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ voteType: type === 'up' ? 'UPVOTE' : 'DOWNVOTE' }),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      if (typeof d.upvotes === 'number') setCounts({ up: d.upvotes, down: d.downvotes });
      setSelected(d.voteType === 'UPVOTE' ? 'up' : d.voteType === 'DOWNVOTE' ? 'down' : null);
    } catch {
      setCounts(prev.counts);
      setSelected(prev.selected);
    } finally {
      busy.current = false;
    }
  };

  const base =
    'flex items-center gap-2.5 rounded-[4px] border px-4 py-2.5 text-[11px] tracking-[0.14em] uppercase transition-all duration-300 cursor-none';
  const off = 'text-[#8a8a82] border-white/15 hover:text-[#ece9e1] hover:border-white/40';
  const on = 'bg-[#ece9e1] text-[#0a0a0a] border-[#ece9e1]';

  const Count = ({ value }: { value: number }) => (
    <span className="inline-block min-w-[2ch] overflow-hidden text-left">
      <motion.span
        key={value}
        initial={{ y: 9, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block"
      >
        {value}
      </motion.span>
    </span>
  );

  return (
    <div className="flex flex-wrap items-center gap-3 select-none" style={{ fontFamily: 'var(--font-mono), monospace' }}>
      <span className="text-[10px] tracking-[0.2em] uppercase text-[#8a8a82] mr-1">Was this useful?</span>
      <motion.button onClick={() => vote('up')} whileTap={{ scale: 0.92 }} aria-pressed={selected === 'up'} title="Upvote"
        className={`${base} ${selected === 'up' ? on : off}`}>
        ▲ <Count value={counts.up} />
      </motion.button>
      <motion.button onClick={() => vote('down')} whileTap={{ scale: 0.92 }} aria-pressed={selected === 'down'} title="Downvote"
        className={`${base} ${selected === 'down' ? on : off}`}>
        ▼ <Count value={counts.down} />
      </motion.button>
    </div>
  );
}
