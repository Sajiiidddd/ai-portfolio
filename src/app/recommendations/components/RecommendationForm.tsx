// app/recommendations/components/RecommendationForm.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalContentSearchResult } from '../interfaces';

interface RecommendationFormProps {
  onAddRecommendation: (
    externalContent: ExternalContentSearchResult,
    recommendedBy: string,
    review: string
  ) => void;
}

// Mock search results (replace with actual API calls in Phase 2)
const MOCK_MOVIE_RESULTS: ExternalContentSearchResult[] = [
  {
    externalId: 'tt0111161', // Shawshank Redemption TMDB/IMDB ID
    type: 'movie',
    title: 'The Shawshank Redemption',
    subtitle: 'Frank Darabont',
    imageUrl: 'https://image.tmdb.org/t/p/w500/q6y0sLTDLpS6o56Jz8A4oJ1smgA.jpg',
    year: '1994',
  },
  {
    externalId: 'tt0468569', // The Dark Knight TMDB/IMDB ID
    type: 'movie',
    title: 'The Dark Knight',
    subtitle: 'Christopher Nolan',
    imageUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911JEWPzYDh5dPs.jpg',
    year: '2008',
  },
  {
    externalId: 'tt1375666', // Inception TMDB/IMDB ID
    type: 'movie',
    title: 'Inception',
    subtitle: 'Christopher Nolan',
    imageUrl: 'https://image.tmdb.org/t/p/w500/AbgEQO2WgcS6HwO1C7VN3vP1X73.jpg',
    year: '2010',
  },
];

const MOCK_SONG_RESULTS: ExternalContentSearchResult[] = [
  {
    externalId: '7pKfPOMFGDFBnRvCDOEVi6', // Bohemian Rhapsody Spotify ID
    type: 'song',
    title: 'Bohemian Rhapsody',
    subtitle: 'Queen',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b2734a36257d07d12f369ed0e505',
    year: '1975',
  },
  {
    externalId: '3skn2Lj4d1SjX9gUv4Z0pZ', // Blinding Lights Spotify ID
    type: 'song',
    title: 'Blinding Lights',
    subtitle: 'The Weeknd',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b273b4007823f6e1b78997a31b40',
    year: '2019',
  },
  {
    externalId: '6DCZJvI2bHh8C6u8z0q0o0', // Hotel California Spotify ID
    type: 'song',
    title: 'Hotel California',
    subtitle: 'Eagles',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b273ff255562d478e85848e36e1b',
    year: '1976',
  },
];


export default function RecommendationForm({ onAddRecommendation }: RecommendationFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'movie' | 'song'>('movie');
  const [searchResults, setSearchResults] = useState<ExternalContentSearchResult[]>([]);
  const [selectedContent, setSelectedContent] = useState<ExternalContentSearchResult | null>(null);
  const [recommendedBy, setRecommendedBy] = useState('');
  const [review, setReview] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSelectedContent(null); // Clear previous selection

    if (!searchQuery.trim()) {
      setError("Please enter a search query.");
      setSearchResults([]);
      return;
    }

    // --- Mock Search Logic ---
    if (searchType === 'movie') {
      const filtered = MOCK_MOVIE_RESULTS.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.length > 0 ? filtered : MOCK_MOVIE_RESULTS); // Show all mock if no filter match
    } else { // song
      const filtered = MOCK_SONG_RESULTS.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.length > 0 ? filtered : MOCK_SONG_RESULTS); // Show all mock if no filter match
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedContent) {
      setError("Please select a movie or song from the search results.");
      return;
    }
    if (!review.trim()) {
      setError("Please add your review/comment.");
      return;
    }

    onAddRecommendation(selectedContent, recommendedBy, review);

    // Reset form
    setSearchQuery('');
    setSearchResults([]);
    setSelectedContent(null);
    setRecommendedBy('');
    setReview('');
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-700 max-w-2xl mx-auto mb-8">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Recommend a Movie or Song</h2>

      {error && (
        <p className="bg-red-900 text-red-300 p-3 rounded mb-4 text-sm">{error}</p>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6 border-b border-gray-700 pb-6">
        <div className="flex items-center space-x-4 mb-4">
          <label htmlFor="searchType" className="text-gray-300 text-lg font-medium">I want to recommend a:</label>
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setSearchType('movie'); setSearchResults([]); setSelectedContent(null); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                searchType === 'movie' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              Movie
            </button>
            <button
              type="button"
              onClick={() => { setSearchType('song'); setSearchResults([]); setSelectedContent(null); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                searchType === 'song' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              Song
            </button>
          </div>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder={`Search for a ${searchType === 'movie' ? 'movie title' : 'song title or artist'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">Search Results:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {searchResults.map((result) => (
              <div
                key={result.externalId}
                className={`relative bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer
                  ${selectedContent?.externalId === result.externalId ? 'ring-2 ring-purple-500' : 'hover:ring-1 hover:ring-gray-600'}
                  transition-all duration-200`}
                onClick={() => setSelectedContent(result)}
              >
                <div className="relative w-full aspect-w-2 aspect-h-3">
                  <Image
                    src={result.imageUrl || '/placeholder-image.png'}
                    alt={result.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png';
                    }}
                  />
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium text-white truncate">{result.title}</p>
                  <p className="text-xs text-gray-400 truncate">{result.subtitle} {result.year && `(${result.year})`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Content Display */}
      {selectedContent && (
        <div className="bg-gray-800 p-4 rounded-lg flex items-center space-x-4 mb-6 border border-purple-600">
          <div className="relative w-16 h-24 flex-shrink-0">
            <Image
              src={selectedContent.imageUrl || '/placeholder-image.png'}
              alt={selectedContent.title}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">{selectedContent.title}</h4>
            <p className="text-sm text-gray-400">{selectedContent.subtitle} {selectedContent.year && `(${selectedContent.year})`}</p>
          </div>
        </div>
      )}

      {/* Recommendation Details Form */}
      {selectedContent && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="recommendedBy" className="block text-gray-300 text-sm font-medium mb-2">Your Name (Optional):</label>
            <input
              type="text"
              id="recommendedBy"
              value={recommendedBy}
              onChange={(e) => setRecommendedBy(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Jane Doe"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="review" className="block text-gray-300 text-sm font-medium mb-2">Your Review/Comment:</label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Why do you recommend this?"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Add Recommendation
          </button>
        </form>
      )}
    </div>
  );
}