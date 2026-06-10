'use client';
import { useState, useTransition } from 'react';

export default function VoteButtons({ id, upvotes, downvotes }: { id: string, upvotes: number, downvotes: number }) {
  const [isPending, startTransition] = useTransition();
  const [votes, setVotes] = useState({ upvotes, downvotes });

  const handleVote = (type: 'up' | 'down') => {
    startTransition(async () => {
      const res = await fetch(`/api/blogs/${id}/votes`, {
        method: 'POST',
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        setVotes({ upvotes: data.upvotes, downvotes: data.downvotes });
      }
    });
  };

  return (
    <div className="flex items-center gap-6 mt-4">
      <button
        onClick={() => handleVote('up')}
        className="text-green-400 hover:text-green-200 transition text-sm"
        disabled={isPending}
      >
        👍 {votes.upvotes}
      </button>
      <button
        onClick={() => handleVote('down')}
        className="text-red-400 hover:text-red-200 transition text-sm"
        disabled={isPending}
      >
        👎 {votes.downvotes}
      </button>
    </div>
  );
}
