'use client';

import { useState } from 'react';
import Turnstile from '@/components/Turnstile';

const MONO = { fontFamily: 'var(--font-mono), monospace' } as const;

export default function AdminLoginPage() {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [tsToken, setTsToken] = useState('');

  const submit = async () => {
    if (busy || !pw) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw, turnstileToken: tsToken }),
      });
      if (r.ok) { window.location.href = '/admin'; return; }
      const d = await r.json().catch(() => ({}));
      setErr(d.error || 'Login failed.'); setBusy(false);
    } catch { setErr('Network error.'); setBusy(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-[#ece9e1] px-4">
      <div className="w-full max-w-sm">
        <div style={MONO} className="text-[11px] tracking-[0.2em] uppercase text-[#8a8a82] mb-3">◢ Admin</div>
        <h1 className="text-2xl font-light mb-6">Sign in</h1>
        <input
          type="password" value={pw} autoFocus
          onChange={(e) => { setPw(e.target.value); setErr(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder="Password"
          className="w-full bg-[#0c0c0c] border border-white/[0.12] rounded-[5px] px-3.5 py-3 text-sm text-[#ece9e1] placeholder-[#55554f] focus:border-white/50 focus:outline-none"
        />
        {err && <p style={MONO} className="mt-3 text-[10px] tracking-[0.12em] uppercase text-[#ff8a83]">{err}</p>}
        <Turnstile onToken={setTsToken} />
        <button
          onClick={submit} disabled={busy || !pw} style={MONO}
          className="mt-4 w-full text-[11px] tracking-[0.14em] uppercase px-5 py-3 rounded-[5px] bg-[#ece9e1] text-[#0a0a0a] hover:opacity-80 disabled:opacity-30 transition-all"
        >
          {busy ? 'Signing in…' : 'Enter →'}
        </button>
      </div>
    </main>
  );
}
