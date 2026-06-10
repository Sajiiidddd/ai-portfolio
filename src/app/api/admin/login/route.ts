import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminConfigured, checkPassword, sessionToken } from '@/lib/admin';
import { rateLimit, ipOf } from '@/lib/ratelimit';
import { verifyTurnstile } from '@/lib/turnstile';

export async function POST(req: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: 'Admin is not configured (set ADMIN_PASSWORD).' }, { status: 503 });
  }
  if (!(await rateLimit(`admin-login:${ipOf(req)}`, 5, 60_000))) {
    return NextResponse.json({ error: 'Too many attempts — wait a minute.' }, { status: 429 });
  }
  const { password, turnstileToken } = (await req.json().catch(() => ({}))) as { password?: string; turnstileToken?: string };
  if (!(await verifyTurnstile(turnstileToken, ipOf(req)))) {
    return NextResponse.json({ error: 'Verification failed — please retry.' }, { status: 403 });
  }
  if (!checkPassword(String(password ?? ''))) {
    return NextResponse.json({ error: 'Wrong password.' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken()!, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
