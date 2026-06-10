import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fromRequest as getUserId, attachUserCookie } from '@/lib/identity';

const TYPES = ['MOVIE', 'SONG'];

export async function GET(req: NextRequest) {
  const { userId } = getUserId(req);
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const recs = await prisma.recommendation.findMany({
    where: type && TYPES.includes(type) ? { type } : {},
    orderBy: [{ upvotes: 'desc' }, { createdAt: 'desc' }],
  });
  const ids = recs.map((r) => r.id);
  const votes = ids.length
    ? await prisma.recommendationVote.findMany({ where: { userId, recommendationId: { in: ids } }, select: { recommendationId: true, type: true } })
    : [];
  const vmap = new Map(votes.map((v) => [v.recommendationId, v.type]));
  return NextResponse.json(
    recs.map((r) => ({
      id: r.id, type: r.type, title: r.title, subtitle: r.subtitle, imageUrl: r.imageUrl, year: r.year,
      review: r.review, recommendedBy: r.recommendedBy, upvotes: r.upvotes, downvotes: r.downvotes,
      mine: r.userId === userId, userVote: vmap.get(r.id) ?? null,
    })),
  );
}

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const type = String(b.type ?? '');
  if (!TYPES.includes(type)) return NextResponse.json({ error: 'Type must be MOVIE or SONG.' }, { status: 400 });
  const title = String(b.title ?? '').trim();
  const review = String(b.review ?? '').trim();
  const recommendedBy = String(b.recommendedBy ?? '').trim();
  if (!title || !b.externalId) return NextResponse.json({ error: 'Pick something first.' }, { status: 400 });
  if (!recommendedBy) return NextResponse.json({ error: 'Please add your name.' }, { status: 400 });
  if (!review || review.length > 50) return NextResponse.json({ error: 'Review is required (max 50 chars).' }, { status: 400 });

  const { userId, isNew } = getUserId(req);
  const count = await prisma.recommendation.count({ where: { type, userId } });
  if (count >= 3) return NextResponse.json({ error: `You've used all 3 ${type.toLowerCase()} picks — remove one to swap.` }, { status: 403 });

  const rec = await prisma.recommendation.create({
    data: {
      type, externalId: String(b.externalId), title,
      subtitle: b.subtitle ? String(b.subtitle) : null,
      imageUrl: b.imageUrl ? String(b.imageUrl) : null,
      year: b.year ? String(b.year) : null,
      review, recommendedBy: recommendedBy.slice(0, 40), userId, timestamp: BigInt(Date.now()),
    },
  });
  const res = NextResponse.json({
    id: rec.id, type: rec.type, title: rec.title, subtitle: rec.subtitle, imageUrl: rec.imageUrl, year: rec.year,
    review: rec.review, recommendedBy: rec.recommendedBy, upvotes: rec.upvotes, downvotes: rec.downvotes, mine: true, userVote: null,
  }, { status: 201 });
  if (isNew) attachUserCookie(res, userId);
  return res;
}
