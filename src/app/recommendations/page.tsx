// src/app/recommendations/page.tsx
'use client';

import { useState } from 'react';
import RecommendationFeed from '@/components/RecommendationFeed';
import RecommendationForm from '@/components/RecommendationForm';
import FooterNav from '@/components/FooterNav';
import BigNameOverlay from '@/components/RecommenderOverlay';
import YourSuggestionsButton from '@/components/YourSuggestionsButton';

export default function RecommendationsPage() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Overlay Title */}
      <div className="absolute top-10 left-0 right-0 z-50">
        <BigNameOverlay />
      </div>

      {/* Top Action Bar */}
      <div className="relative z-30 mt-[180px] flex flex-wrap justify-between items-center px-6 py-4 bg-black/70 backdrop-blur-md border-b border-white/10 gap-2">
        <button
          onClick={() => setFormOpen(true)}
          className="px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition"
        >
          Want to Suggest?
        </button>

        <YourSuggestionsButton />
      </div>

      {/* Feed Section */}
      <section className="px-4 pt-6 pb-32 space-y-12">
        {/* Movies */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Movies</h2>
          <RecommendationFeed type="MOVIE" />
        </div>

        {/* Songs */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Songs</h2>
          <RecommendationFeed type="SONG" />
        </div>
      </section>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <FooterNav />
      </div>

      {/* Suggest Form Modal */}
      {formOpen && <RecommendationForm onClose={() => setFormOpen(false)} />}
    </main>
  );
}







