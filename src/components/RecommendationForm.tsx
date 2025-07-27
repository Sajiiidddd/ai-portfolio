'use client';

import { useState, useRef } from 'react';
import { useAnonIdContext } from './ClientProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onClose: () => void;
}

interface Recommendation {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  year: string;
}

export default function RecommendationForm({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'MOVIE' | 'SONG'>('MOVIE');
  const [results, setResults] = useState<Recommendation[]>([]);
  const [selected, setSelected] = useState<Recommendation | null>(null);
  const [review, setReview] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const anonId = useAnonIdContext();
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (!selected || !review.trim()) return;

    setStatus('submitting');
    const res = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        externalId: String(selected.id),
        title: selected.title,
        subtitle: selected.subtitle,
        imageUrl: selected.imageUrl,
        year: selected.year,
        review: review.trim(),
        recommendedBy: name.trim() || 'Anonymous',
        userId: anonId,
      }),
    });

    if (res.ok) {
      onClose();
      setSelected(null);
      setReview('');
      setName('');
    } else {
      setStatus('error');
    }
  };

  const fetchResults = async () => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const res = await fetch(`/api/search/${type === 'MOVIE' ? 'tmdb' : 'spotify'}?q=${query}`);
    const data = await res.json();
    setResults(data);
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const resetForm = () => {
    setSelected(null);
    setReview('');
    setName('');
    setQuery('');
    setResults([]);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleOutsideClick}
      >
        <motion.div
          ref={modalRef}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-hide shadow-lg border border-white/10 text-white relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white text-xl"
          >
            ✕
          </button>

          <h2 className="text-2xl font-semibold mb-6">Suggest a Movie or Song</h2>

          {/* MOVIE / SONG Toggle */}
          <div className="flex gap-4 mb-4">
            {['MOVIE', 'SONG'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t as 'MOVIE' | 'SONG');
                  resetForm();
                }}
                className={`relative pb-1 text-sm transition ${
                  type === t ? 'text-white font-semibold' : 'text-white/50'
                }`}
              >
                {t}
                {type === t && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          {!selected && (
            <>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  fetchResults();
                }}
                placeholder={`Search ${type.toLowerCase()}s...`}
                className="w-full bg-white/10 rounded px-3 py-2 text-white placeholder:text-white/60 mb-3"
              />

              <div className="space-y-2 overflow-y-auto scrollbar-hide max-h-52">
                {results.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelected(item);
                      setResults([]);
                    }}
                    className="flex items-center gap-3 p-2 bg-white/10 rounded hover:bg-white/20 cursor-pointer"
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                    <div className="text-sm">
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-xs text-white/60">
                        {item.subtitle} {item.year && `(${item.year})`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Review Form */}
          {selected && (
            <div className="mt-6 space-y-4">
              <input
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/10 rounded px-3 py-2 text-white placeholder:text-white/60"
              />
              <textarea
                placeholder="Write a short review (max 50 chars)"
                value={review}
                maxLength={50}
                onChange={(e) => setReview(e.target.value)}
                className="w-full bg-white/10 rounded px-3 py-2 text-white placeholder:text-white/60"
              />
              <button
                onClick={handleSubmit}
                disabled={status === 'submitting'}
                className="w-full bg-white text-black font-medium py-2 rounded hover:bg-neutral-200 transition disabled:opacity-60"
              >
                {status === 'submitting' ? 'Submitting...' : 'Submit'}
              </button>
              {status === 'error' && (
                <p className="text-red-400 text-sm">Submission failed. Please try again.</p>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}






