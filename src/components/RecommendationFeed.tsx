'use client';

import { useEffect, useState } from 'react';
import { useAnonIdContext } from './ClientProvider';
import { motion } from 'framer-motion';

interface Recommendation {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  upvotes: number;
  downvotes: number;
  recommendedBy: string;
  userId: string;
}

interface Props {
  type: 'MOVIE' | 'SONG';
  userOnly?: boolean;
}

export default function RecommendationFeed({ type, userOnly = false }: Props) {
  const anonId = useAnonIdContext();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecs = async () => {
    const res = await fetch(`/api/recommendations?type=${type}&sort=top`);
    const data = await res.json();

    const filtered = userOnly
      ? data.filter((rec: Recommendation) => rec.userId === anonId)
      : data;

    setRecommendations(filtered);
    setLoading(false);
  };

  const handleVote = async (id: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
    const res = await fetch('/api/recommendations/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recommendationId: id, voteType, userId: anonId }),
    });

    if (res.ok) fetchRecs();
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Delete this recommendation?');
    if (!confirmed) return;

    const res = await fetch(`/api/recommendations/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: anonId }),
    });

    if (res.ok) fetchRecs();
  };

  useEffect(() => {
    if (anonId) {
      fetchRecs();
    }
  }, [type, userOnly, anonId]);

  if (loading) return <p className="text-white/60 text-sm">Loading recommendations...</p>;

  if (userOnly && (!anonId || recommendations.length === 0)) {
    return <p className="text-white/60 text-sm italic">You haven’t suggested anything yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 pb-4 scroll-smooth">
        {recommendations.map((rec) => (
          <motion.div
            key={rec.id}
            className="min-w-[200px] max-w-[200px] bg-white/5 backdrop-blur-xl p-3 rounded-xl shadow-lg relative hover:scale-[1.03] transition-transform duration-200"
            whileHover={{ scale: 1.03 }}
          >
            {rec.imageUrl && (
              <img
                src={rec.imageUrl}
                alt={rec.title}
                className="w-full h-40 object-cover rounded-lg mb-2"
              />
            )}

            <div className="font-semibold text-sm truncate">{rec.title}</div>
            <div className="text-xs text-gray-400 truncate">{rec.subtitle}</div>
            <div className="text-xs text-gray-500 italic mt-1">— {rec.recommendedBy}</div>

            {/* Vote Controls */}
            <div className="flex justify-between items-center mt-2 text-sm">
              <motion.button
                onClick={() => handleVote(rec.id, 'UPVOTE')}
                whileTap={{ scale: 1.2 }}
                className="flex items-center gap-1 text-white/70 hover:text-green-400 transition"
              >
                <span className="text-xs">▲</span> {rec.upvotes}
              </motion.button>

              <motion.button
                onClick={() => handleVote(rec.id, 'DOWNVOTE')}
                whileTap={{ scale: 1.2 }}
                className="flex items-center gap-1 text-white/70 hover:text-red-400 transition"
              >
                <span className="text-xs">▼</span> {rec.downvotes}
              </motion.button>
            </div>

            {/* Delete Button for Owner */}
            {anonId && rec.userId === anonId && (
              <button
                onClick={() => handleDelete(rec.id)}
                className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-500 transition"
                title="Delete"
              >
                🗑
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}









