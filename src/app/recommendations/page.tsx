import type { Metadata } from 'next';
import RecommendationsClient from '@/components/RecommendationsClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Recommend me',
  description: 'Drop me a movie or song, vote the leaderboard up or down — pole position is earned.',
  alternates: { canonical: '/recommendations' },
};

export default function Page() {
  return <RecommendationsClient />;
}
