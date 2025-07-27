'use client';

import { useState, useEffect } from 'react';

interface Recommendation {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  year: string;
}

export default function RecommendationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Recommendation[]>([]);
  const [type, setType] = useState<'MOVIE' | 'SONG'>('MOVIE');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Recommendation | null>(null);
  const [name, setName] = useState('');
  const [review, setReview] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let stored = localStorage.getItem('anonId');
    if (!stored) {
      stored = `anon_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('anonId', stored);
    }
    setUserId(stored);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 2) {
        fetchResults();
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query, type]);

  const fetchResults = async () => {
    setLoading(true);
    const res = await fetch(`/api/search/${type === 'MOVIE' ? 'tmdb' : 'spotify'}?q=${query}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!review || review.length > 50) {
      setError('Review must be 1–50 characters.');
      return;
    }

    if (!selected) {
      setError('Please select a recommendation.');
      return;
    }

    const res = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        externalId: String(selected.id),
        title: selected.title,
        subtitle: selected.subtitle || '',
        imageUrl: selected.imageUrl,
        year: selected.year || '',
        review,
        recommendedBy: name || 'Anonymous',
        userId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
    } else {
      setSuccess('✅ Recommendation submitted!');
      setName('');
      setReview('');
      setSelected(null);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        {['MOVIE', 'SONG'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t as 'MOVIE' | 'SONG')}
            className={`px-4 py-1 rounded-full text-sm border ${
              type === t ? 'bg-black text-white' : 'bg-white text-black border-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder={`Search ${type.toLowerCase()}s...`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 border border-gray-700 bg-black text-white rounded placeholder-gray-400"
      />

      {/* Results */}
      {loading && <p className="text-sm text-gray-400">Searching...</p>}
      {results.map((r) => (
        <div
          key={r.id}
          onClick={() => setSelected(r)}
          className={`flex gap-3 items-center p-2 border rounded cursor-pointer ${
            selected?.id === r.id ? 'bg-gray-800 border-white' : 'hover:bg-gray-900'
          }`}
        >
          {r.imageUrl && (
            <img src={r.imageUrl} alt={r.title} className="w-12 h-16 object-cover rounded" />
          )}
          <div>
            <div className="font-semibold text-white">{r.title}</div>
            <div className="text-sm text-gray-400">
              {r.subtitle} {r.year && `(${r.year})`}
            </div>
          </div>
        </div>
      ))}

      {/* Submission Form */}
      {selected && (
        <div className="mt-4 space-y-3 border-t pt-4">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-700 bg-black text-white rounded placeholder-gray-400"
          />

          <textarea
            placeholder="Why do you recommend this? (max 50 chars)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            maxLength={50}
            className="w-full p-2 border border-gray-700 bg-black text-white rounded placeholder-gray-400 resize-none"
            rows={2}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}

          <button
            onClick={handleSubmit}
            className="w-full bg-white text-black rounded font-semibold py-2 hover:bg-gray-200 transition"
          >
            Submit Recommendation
          </button>
        </div>
      )}
    </div>
  );
}

