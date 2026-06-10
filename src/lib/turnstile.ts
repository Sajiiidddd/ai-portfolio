// src/lib/turnstile.ts — server-side verification of a Cloudflare Turnstile token.
// Disabled (always allows) when TURNSTILE_SECRET_KEY is unset, so dev/local works.
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function turnstileEnabled(): boolean {
  return !!process.env.TURNSTILE_SECRET_KEY;
}

export async function verifyTurnstile(token: string | undefined | null, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;        // not configured → don't block
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== 'unknown') body.set('remoteip', ip);
    const res = await fetch(VERIFY_URL, { method: 'POST', body });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}
