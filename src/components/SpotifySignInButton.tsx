'use client';

import { signIn } from 'next-auth/react';

type Props = {
  callbackUrl?: string;
  label?: string;
  className?: string;
};

export default function SpotifySignInButton({
  callbackUrl = '/recommendations',
  label = 'Connect Spotify',
  className = '',
}: Props) {
  return (
    <button
      type="button"
      onClick={() => signIn('spotify', { callbackUrl })}
      className={className || 'rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90'}
    >
      {label}
    </button>
  );
}
