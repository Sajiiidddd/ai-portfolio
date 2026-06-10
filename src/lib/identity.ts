// src/lib/identity.ts
// Single source of truth for anonymous visitor identity.
//
// Model: no login. Each device gets a UUID in a readable `user_id` cookie,
// PLUS an httpOnly `user_sig` cookie holding an HMAC signature of that id.
// The client may read `user_id` (to show Edit/Delete on its own comments),
// but cannot forge ownership: the server only trusts ids whose signature
// verifies. Set IDENTITY_SECRET in .env (and in Vercel for production).
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const USER_COOKIE = 'user_id';
export const SIG_COOKIE = 'user_sig';

const SECRET = process.env.IDENTITY_SECRET || 'dev-only-secret--set-IDENTITY_SECRET';

const BASE_OPTS = { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' as const };

const sign = (id: string) =>
  crypto.createHmac('sha256', SECRET).update(id).digest('hex').slice(0, 32);

function verified(id?: string, sig?: string): boolean {
  if (!id || !sig) return false;
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(sig);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

/** Read (or mint) the anonymous id — via next/headers. Unsigned/forged ids are discarded. */
export async function getOrCreateUserId(): Promise<{ userId: string; isNew: boolean }> {
  const store = await cookies();
  const id = store.get(USER_COOKIE)?.value;
  const sig = store.get(SIG_COOKIE)?.value;
  if (verified(id, sig)) return { userId: id as string, isNew: false };
  return { userId: uuidv4(), isNew: true };
}

/** Same, from a NextRequest. */
export function fromRequest(req: NextRequest): { userId: string; isNew: boolean } {
  const id = req.cookies.get(USER_COOKIE)?.value;
  const sig = req.cookies.get(SIG_COOKIE)?.value;
  if (verified(id, sig)) return { userId: id as string, isNew: false };
  return { userId: uuidv4(), isNew: true };
}

/** Attach both identity cookies to an outgoing response (call when isNew). */
export function attachUserCookie(res: NextResponse, userId: string) {
  res.cookies.set(USER_COOKIE, userId, { ...BASE_OPTS, httpOnly: false });
  res.cookies.set(SIG_COOKIE, sign(userId), { ...BASE_OPTS, httpOnly: true });
  return res;
}
