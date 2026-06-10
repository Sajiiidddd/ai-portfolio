import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { notifySubscribers } from '@/lib/notify';

function secretOk(given: string | null | undefined): boolean {
  const secret = process.env.NOTIFY_SECRET;
  if (!secret || !given) return false;
  const a = Buffer.from(secret), b = Buffer.from(given);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// POST /api/notify  — auth via x-notify-secret header (or { secret } in body).
// Body { slug? } — defaults to the newest published post.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { slug?: string; secret?: string };
  if (!secretOk(req.headers.get('x-notify-secret') || body.secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const r = await notifySubscribers(body.slug);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status ?? 500 });
  return NextResponse.json({ ok: true, post: r.post, subscribers: r.subscribers, sent: r.sent });
}
