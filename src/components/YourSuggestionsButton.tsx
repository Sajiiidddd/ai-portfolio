// components/YourSuggestionsButton.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function YourSuggestionsButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/your-suggestions')}
      className="px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition"
    >
      Your Suggestions
    </button>
  );
}
