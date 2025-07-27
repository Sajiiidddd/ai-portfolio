// src/app/your-suggestions/page.tsx
'use client';

import RecommendationFeed from '@/components/RecommendationFeed';
import FooterNav from '@/components/FooterNav';
import BigNameOverlay from '@/components/RecommenderOverlay';

export default function YourSuggestionsPage() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <div className="absolute top-10 left-0 right-0 z-50">
        <BigNameOverlay />
      </div>

      <div className="relative z-30 px-6 py-28 text-center">
        <h1 className="text-2xl font-bold tracking-wide">Your Movie & Song Suggestions</h1>
        <p className="text-white/60 text-sm mt-2">Manage your personal recommendations</p>
      </div>

      <section className="px-4 pb-32 space-y-12">
        <div>
          <h2 className="text-xl font-semibold mb-2">Movies</h2>
          <RecommendationFeed type="MOVIE" userOnly={true} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Songs</h2>
          <RecommendationFeed type="SONG" userOnly={true} />
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <FooterNav />
      </div>
    </main>
  );
}
