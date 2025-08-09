'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface BlogVotesProps {
  blogId: string;
  upvotes: number;
  downvotes: number;
}

type VoteType = 'UPVOTE' | 'DOWNVOTE';
type LocalVoteType = 'upvote' | 'downvote';

export default function BlogVotes({ blogId, upvotes, downvotes }: BlogVotesProps) {
  const [votes, setVotes] = useState({ upvotes, downvotes });
  const [selected, setSelected] = useState<'up' | 'down' | null>(null);
  const [total, setTotal] = useState(Math.max(0, upvotes - downvotes));

  useEffect(() => {
    const fetchUserVote = async () => {
      try {
        const res = await fetch(`/api/blogs/${blogId}/votes`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.voteType === 'UPVOTE') setSelected('up');
          else if (data.voteType === 'DOWNVOTE') setSelected('down');
          else setSelected(null);

          if (typeof data.upvotes === 'number' && typeof data.downvotes === 'number') {
            setVotes({ upvotes: data.upvotes, downvotes: data.downvotes });
          }
        }
      } catch (err) {
        console.error('Failed to fetch user vote', err);
      }
    };
    fetchUserVote();
  }, [blogId]);

  useEffect(() => {
    setTotal(Math.max(0, votes.upvotes - votes.downvotes));
  }, [votes]);

  const handleVote = async (voteType: LocalVoteType) => {
    const backendVoteType: VoteType = voteType === 'upvote' ? 'UPVOTE' : 'DOWNVOTE';
    const newVotes = { ...votes };
    let newSelected = selected;

    if (selected === 'up' && voteType === 'upvote') {
      newVotes.upvotes = Math.max(0, newVotes.upvotes - 1);
      newSelected = null;
    } else if (selected === 'down' && voteType === 'downvote') {
      newVotes.downvotes = Math.max(0, newVotes.downvotes - 1);
      newSelected = null;
    } else if (selected === 'up' && voteType === 'downvote') {
      newVotes.upvotes = Math.max(0, newVotes.upvotes - 1);
      newVotes.downvotes += 1;
      newSelected = 'down';
    } else if (selected === 'down' && voteType === 'upvote') {
      newVotes.downvotes = Math.max(0, newVotes.downvotes - 1);
      newVotes.upvotes += 1;
      newSelected = 'up';
    } else if (voteType === 'upvote') {
      newVotes.upvotes += 1;
      newSelected = 'up';
    } else if (voteType === 'downvote') {
      newVotes.downvotes += 1;
      newSelected = 'down';
    }

    setVotes(newVotes);
    setSelected(newSelected);

    try {
      const res = await fetch(`/api/blogs/${blogId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ voteType: backendVoteType }),
      });
      if (res.ok) {
        const updated = await res.json();
        if (typeof updated.upvotes === 'number' && typeof updated.downvotes === 'number') {
          setVotes({ upvotes: updated.upvotes, downvotes: updated.downvotes });
        }
        if (updated.voteType === 'UPVOTE') setSelected('up');
        else if (updated.voteType === 'DOWNVOTE') setSelected('down');
        else setSelected(null);
      }
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  const iconVariants: Variants = {
    default: { scale: 1, y: 0, transition: { type: 'tween', duration: 0.2, ease: 'easeInOut' } },
    active:  { scale: 1.1, y: -2, transition: { type: 'tween', duration: 0.2, ease: 'easeInOut' } },
  };

  const ORANGE = '#f97316';
  const GRAY = '#9ca3af';

  return (
    <div className="flex items-center gap-1 mt-6 self-start text-white select-none">
      {/* Upvote Button */}
      <motion.button
        onClick={() => handleVote('upvote')}
        whileTap={{ scale: 0.95 }}
        title="Upvote"
        className="p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        aria-pressed={selected === 'up'}
      >
        <motion.svg
          custom="up"
          variants={iconVariants}
          animate={selected === 'up' ? 'active' : 'default'}
          whileHover={{ scale: 1.15, y: -4, transition: { type: 'tween', duration: 0.25, ease: 'easeOut' } }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={selected === 'up' ? ORANGE : GRAY}
          stroke={selected === 'up' ? ORANGE : GRAY}
          strokeWidth="2"
          className="w-7 h-7 transition-colors duration-200 cursor-pointer hover:fill-[#f97316] hover:stroke-[#f97316]"
        >
          <path d="M4 16h16L12 6 4 16z" />
        </motion.svg>
      </motion.button>

      {/* Vote Total */}
      <div className="h-6 w-12 flex justify-center items-center overflow-hidden select-text">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={total}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="text-base font-mono text-gray-400"
            title={`${votes.upvotes} up / ${votes.downvotes} down`}
          >
            {total}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Downvote Button */}
      <motion.button
        onClick={() => handleVote('downvote')}
        whileTap={{ scale: 0.95 }}
        title="Downvote"
        className="p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        aria-pressed={selected === 'down'}
      >
        <motion.svg
          custom="down"
          variants={iconVariants}
          animate={selected === 'down' ? 'active' : 'default'}
          whileHover={{ scale: 1.15, y: 4, transition: { type: 'tween', duration: 0.25, ease: 'easeOut' } }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={selected === 'down' ? ORANGE : GRAY}
          stroke={selected === 'down' ? ORANGE : GRAY}
          strokeWidth="2"
          className="w-7 h-7 transition-colors duration-200 cursor-pointer hover:fill-[#f97316] hover:stroke-[#f97316]"
        >
          <path d="M4 8h16L12 18 4 8z" />
        </motion.svg>
      </motion.button>
    </div>
  );
}










