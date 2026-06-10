import { NextRequest, NextResponse } from 'next/server';
import { isAdminReq } from '@/lib/admin';
import { notifySubscribers } from '@/lib/notify';

export async function POST(req: NextRequest) {
  if (!isAdminReq(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  const r = await notifySubscribers(slug);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status ?? 500 });
  return NextResponse.json({ ok: true, post: r.post, subscribers: r.subscribers, sent: r.sent });
}
