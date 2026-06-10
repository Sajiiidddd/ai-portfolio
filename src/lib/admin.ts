// src/lib/admin.ts
// Lightweight single-author admin gate: one shared password (ADMIN_PASSWORD).
// Login verifies the password and sets an httpOnly cookie holding an HMAC of the
// password (never the password itself). Requests are authed by recomparing.
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

export const ADMIN_COOKIE = 'admin_session';
const SECRET = process.env.IDENTITY_SECRET || 'dev-only-secret--set-IDENTITY_SECRET';

function expectedToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return crypto.createHmac('sha256', SECRET).update(`admin:${pw}`).digest('hex');
}

function safeEq(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function adminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

export function checkPassword(input: string): boolean {
  return safeEq(process.env.ADMIN_PASSWORD ?? null, input);
}

export function sessionToken(): string | null {
  return expectedToken();
}

/** Server component / route via next/headers. */
export async function isAdmin(): Promise<boolean> {
  const t = expectedToken();
  if (!t) return false;
  const c = (await cookies()).get(ADMIN_COOKIE)?.value;
  return safeEq(c, t);
}

/** Route handler via NextRequest. */
export function isAdminReq(req: NextRequest): boolean {
  const t = expectedToken();
  if (!t) return false;
  return safeEq(req.cookies.get(ADMIN_COOKIE)?.value, t);
}
