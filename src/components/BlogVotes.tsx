'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface BlogVotesProps {
  blogId: string;
  upvotes: number;
  downvotes: number;
}

export default function BlogVotes({ blogId, upvotes, downvotes }: BlogVotesProps) {
  const [votes, setVotes] = useState({ upvotes, downvotes });
  const [selected, setSelected] = useState<'up' | 'down' | null>(null);
  const [total, setTotal] = useState(Math.max(upvotes - downvotes, 0));

  useEffect(() => {
    setTotal(Math.max(votes.upvotes - votes.downvotes, 0));
  }, [votes]);

  const handleVote = async (type: 'upvote' | 'downvote') => {
    const unvote = (selected === 'up' && type === 'upvote') || (selected === 'down' && type === 'downvote');

    const res = await fetch(`/api/blogs/${blogId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: unvote ? 'unvote' : type }),
    });

    if (res.ok) {
      const updated = await res.json();
      setVotes({
        upvotes: updated.upvotes,
        downvotes: updated.downvotes,
      });
      setSelected(unvote ? null : type === 'upvote' ? 'up' : 'down');
    }
  };

  const iconVariants: Variants = {
  default: { scale: 1, y: 0 },
  active: {
    scale: 1.1,
    y: 0, // default, overridden via `custom` below
    transition: { type: 'spring', stiffness: 300 },
  },
};
  return (
    <div className="flex items-center gap-2 mt-6 self-start text-white">
      {/* Upvote */}
      <motion.button
        onClick={() => handleVote('upvote')}
        whileTap={{ scale: 0.9 }}
        title="Upvote"
        className="p-1"
      >
        <motion.svg
          custom="up"
          variants={iconVariants}
          animate={selected === 'up' ? 'active' : 'default'}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-7 h-7 transition-colors duration-200 ${
            selected === 'up' ? 'text-gray-400' : 'text-white'
          }`}
        >
          <path
            d="M4 16h16L12 6 4 16z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </motion.svg>
      </motion.button>

      {/* Vote Count */}
      <div className="h-6 w-10 flex justify-center items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={total}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-base font-mono text-gray-400"
            title={`${votes.upvotes} up / ${votes.downvotes} down`}
          >
            {total}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Downvote */}
      <motion.button
        onClick={() => handleVote('downvote')}
        whileTap={{ scale: 0.9 }}
        title="Downvote"
        className="p-1"
      >
        <motion.svg
          custom="down"
          variants={iconVariants}
          animate={selected === 'down' ? 'active' : 'default'}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-7 h-7 transition-colors duration-200 ${
            selected === 'down' ? 'text-gray-400' : 'text-white'
          }`}
        >
          <path
            d="M4 8h16L12 18 4 8z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </motion.svg>
      </motion.button>
    </div>
  );
}





