'use client';

import { useState } from 'react';

export default function CopyLink() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="as-copy"
      onClick={() => {
        navigator.clipboard?.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? 'Copied ✓' : 'Copy link'}
    </button>
  );
}
