'use client';

import { useEffect, useRef } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

/** Renders the Turnstile widget and calls onToken with the solved token (or '' when reset). Renders nothing if no site key. */
export default function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !ref.current || !window.turnstile || widgetId.current != null) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        theme: 'dark',
        callback: (t: string) => onToken(t),
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
      });
    };

    if (window.turnstile) { render(); return; }

    const id = 'cf-turnstile-script';
    if (!document.getElementById(id)) {
      const sc = document.createElement('script');
      sc.id = id;
      sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      sc.async = true; sc.defer = true; sc.onload = render;
      document.head.appendChild(sc);
    }
    const iv = setInterval(() => { if (window.turnstile) { render(); clearInterval(iv); } }, 250);
    return () => { cancelled = true; clearInterval(iv); };
  }, [onToken]);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="mt-3" />;
}
