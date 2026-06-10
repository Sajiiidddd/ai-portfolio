'use client';

import { useEffect, useState } from 'react';
import Turnstile from './Turnstile';

const MONO = { fontFamily: 'var(--font-mono), monospace' } as const;

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function SubscribeForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [tsToken, setTsToken] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [msg, setMsg] = useState('');

  // Reflect the redirect from confirm/unsubscribe links.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('subscribe');
    if (p === 'confirmed') { setStatus('done'); setMsg('You’re in. You’ll get an email when I publish something new.'); }
    else if (p === 'unsubscribed') { setStatus('done'); setMsg('Unsubscribed. No more emails — no hard feelings.'); }
    else if (p === 'invalid') { setStatus('error'); setMsg('That link was invalid or expired.'); }
  }, []);

  const submit = async () => {
    if (status === 'loading') return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setStatus('error'); setMsg('Enter a valid email.'); return; }
    setStatus('loading'); setMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, website, turnstileToken: tsToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Something went wrong.');
      setStatus('done');
      setMsg(data?.already ? 'You’re already subscribed.' : 'Almost there — check your inbox to confirm.');
    } catch (e) {
      setStatus('error');
      setMsg(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  return (
    <section className="mt-16 border border-white/[0.1] rounded-[8px] p-7 bg-[#0c0c0c]/40">
      <div style={MONO} className="text-[11px] tracking-[0.18em] uppercase text-[#8a8a82] mb-2">◢ Subscribe</div>
      <h3 className="text-[#ece9e1] text-xl font-light mb-1.5">Get new posts in your inbox</h3>
      <p className="text-[#9b9b91] text-sm font-light mb-5 max-w-md">
        No spam, no schedule — just an email when I publish something new. Confirm once and you’re set.
      </p>

      {status === 'done' ? (
        <p style={MONO} className="text-[11px] tracking-[0.1em] uppercase text-[#9ec88a] bg-white/[0.04] border border-white/[0.1] rounded-[5px] px-4 py-3 inline-block">
          {msg}
        </p>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            className="sm:w-[34%] bg-[#0c0c0c] border border-white/[0.12] rounded-[5px] px-3.5 py-3 text-sm text-[#ece9e1] placeholder-[#55554f] focus:border-white/50 focus:outline-none transition-colors"
          />
          <input
            type="text" value={website} onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1} autoComplete="off" aria-hidden="true" placeholder="Website"
            style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, opacity: 0 }}
          />
          <input
            type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            placeholder="you@email.com"
            className="flex-1 bg-[#0c0c0c] border border-white/[0.12] rounded-[5px] px-3.5 py-3 text-sm text-[#ece9e1] placeholder-[#55554f] focus:border-white/50 focus:outline-none transition-colors"
          />
          <Turnstile onToken={setTsToken} />
          <button
            onClick={submit} disabled={status === 'loading' || !email.trim()} style={MONO}
            className="text-[11px] tracking-[0.14em] uppercase px-5 py-3 rounded-[5px] bg-[#ece9e1] text-[#0a0a0a] hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all whitespace-nowrap"
          >
            {status === 'loading' ? 'Sending…' : 'Subscribe →'}
          </button>
        </div>
      )}
      {status === 'error' && (
        <p style={MONO} className="mt-3 text-[10px] tracking-[0.12em] uppercase text-[#ff8a83]">{msg}</p>
      )}
    </section>
  );
}
