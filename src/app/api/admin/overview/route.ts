import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminReq } from '@/lib/admin';

export async function GET(req: NextRequest) {
  if (!isAdminReq(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const since = new Date(); since.setHours(0, 0, 0, 0); since.setDate(since.getDate() - 13);

  const [pub, draft, comments, hidden, likes, voteGroups, conf, pend, subRecent, recTotal, recVotes, recsAll,
    topPostsRaw, rc, rs, rr] = await Promise.all([
    prisma.blog.count({ where: { published: true } }),
    prisma.blog.count({ where: { published: false } }),
    prisma.comment.count(),
    prisma.comment.count({ where: { hidden: true } }),
    prisma.commentLike.count(),
    prisma.vote.groupBy({ by: ['type'], _count: { _all: true } }),
    prisma.subscriber.count({ where: { confirmed: true } }),
    prisma.subscriber.count({ where: { confirmed: false } }),
    prisma.subscriber.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.recommendation.count(),
    prisma.recommendationVote.count(),
    prisma.recommendation.findMany({ select: { title: true, recommendedBy: true, upvotes: true, downvotes: true } }),
    prisma.blog.findMany({ where: { published: true }, select: { title: true, slug: true, _count: { select: { comments: true, votes: true } } } }),
    prisma.comment.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { createdAt: true, user: { select: { name: true } }, blog: { select: { title: true } } } }),
    prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { createdAt: true, email: true } }),
    prisma.recommendation.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { createdAt: true, title: true, recommendedBy: true } }),
  ]);

  const up = voteGroups.find((g) => g.type === 'UPVOTE')?._count._all ?? 0;
  const down = voteGroups.find((g) => g.type === 'DOWNVOTE')?._count._all ?? 0;

  const days = [...Array(14)].map((_, i) => { const d = new Date(since); d.setDate(since.getDate() + i); return { key: d.toISOString().slice(0, 10), label: `${d.getMonth() + 1}/${d.getDate()}`, n: 0 }; });
  subRecent.forEach((s) => { const k = new Date(s.createdAt).toISOString().slice(0, 10); const b = days.find((x) => x.key === k); if (b) b.n++; });

  const recsTop = recsAll.map((r) => ({ title: r.title, by: r.recommendedBy, net: r.upvotes - r.downvotes })).sort((a, b) => b.net - a.net)[0] ?? null;
  const players = new Set(recsAll.map((r) => r.recommendedBy)).size;
  const topPosts = topPostsRaw.map((p) => ({ title: p.title, slug: p.slug, comments: p._count.comments, votes: p._count.votes }))
    .sort((a, b) => (b.comments + b.votes) - (a.comments + a.votes)).slice(0, 5);

  let agent = { total: 0, gemini: 0, fallback: 0, top: [] as { question: string; count: number }[] };
  let recentQ: { createdAt: Date; question: string }[] = [];
  try {
    const [t, g, top, rq] = await Promise.all([
      prisma.agentQuery.count(),
      prisma.agentQuery.groupBy({ by: ['source'], _count: { _all: true } }),
      prisma.agentQuery.groupBy({ by: ['question'], _count: { question: true }, orderBy: { _count: { question: 'desc' } }, take: 6 }),
      prisma.agentQuery.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { createdAt: true, question: true } }),
    ]);
    const gem = g.find((x) => x.source === 'gemini')?._count._all ?? 0;
    agent = { total: t, gemini: gem, fallback: t - gem, top: top.map((x) => ({ question: x.question, count: x._count.question })) };
    recentQ = rq;
  } catch {}

  const recent = [
    ...rc.map((c) => ({ kind: 'comment', label: `${c.user?.name?.trim() || 'Anonymous'} commented on ${c.blog.title}`, at: c.createdAt })),
    ...rs.map((s) => ({ kind: 'subscriber', label: `${s.email} subscribed`, at: s.createdAt })),
    ...recentQ.map((q) => ({ kind: 'question', label: `Asked: "${q.question.slice(0, 60)}"`, at: q.createdAt })),
    ...rr.map((r) => ({ kind: 'rec', label: `${r.recommendedBy} recommended ${r.title}`, at: r.createdAt })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 8);

  return NextResponse.json({
    posts: { published: pub, drafts: draft },
    comments: { total: comments, hidden },
    likes, votes: { up, down },
    subscribers: { confirmed: conf, pending: pend, growth: days.map((d) => ({ label: d.label, n: d.n })) },
    recs: { total: recTotal, votes: recVotes, players, top: recsTop },
    agent, topPosts, recent,
  });
}
