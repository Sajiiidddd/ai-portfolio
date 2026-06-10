// src/app/api/blogs/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VoteType } from '@prisma/client';
import { getCurrentUserId } from '@/lib/auth';
import { rateLimit, ipOf } from '@/lib/ratelimit';
import { sendMail, mailReady, siteUrl, emailShell, btn, escapeHtml } from '@/lib/mailer';
import { verifyTurnstile } from '@/lib/turnstile';

import { fromRequest as getUserIdFromCookie, attachUserCookie as setCookieOnResponse } from '@/lib/identity';

// GET: fetch all comments for a blog
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userId } = getUserIdFromCookie(request);

    const comments = await prisma.comment.findMany({
      where: { blogId: id, hidden: false },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { likes: true } },
        likes: { where: { userId }, select: { id: true } },
      },
    });

    // Map likes -> commenters via the shared anonymous identity:
    // which of these comment authors also liked (upvoted) this post?
    const authorIds = [...new Set(comments.map((c) => c.userId))];
    const upvoters = authorIds.length
      ? await prisma.vote.findMany({
          where: { blogId: id, type: VoteType.UPVOTE, userId: { in: authorIds } },
          select: { userId: true },
        })
      : [];
    const likedPost = new Set(upvoters.map((v) => v.userId));

    const normalized = comments.map((c) => ({
      ...c,
      likeCount: c._count.likes,
      likedByMe: c.likes.length > 0,
      authorLikedPost: likedPost.has(c.userId),
      _count: undefined,
      likes: undefined,
      user: {
        ...c.user,
        name: c.user?.name?.trim() || 'Anonymous',
      },
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('[GET /api/blogs/[id]/comments]', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST: create a new comment
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { content, author, website, turnstileToken } = body ?? {};

    // Honeypot: real users never fill this hidden field.
    if (typeof website === 'string' && website.trim() !== '') {
      return NextResponse.json({ error: 'Rejected' }, { status: 422 });
    }
    // Rate limit: 5 comments / minute / IP.
    if (!(await rateLimit(`c:${ipOf(request)}`, 5, 60_000))) {
      return NextResponse.json({ error: 'Too many comments — slow down.' }, { status: 429 });
    }
    if (!(await verifyTurnstile(turnstileToken, ipOf(request)))) {
      return NextResponse.json({ error: 'Verification failed — please retry.' }, { status: 403 });
    }
    // Validation: types + length caps.
    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: 'Comment too long (max 2000 chars).' }, { status: 400 });
    }
    if (author != null && (typeof author !== 'string' || author.length > 60)) {
      return NextResponse.json({ error: 'Name too long (max 60 chars).' }, { status: 400 });
    }

    const { userId, isNew } = await getCurrentUserId();

    await prisma.user.upsert({
      where: { id: userId },
      update: author?.trim() ? { name: author.trim() } : {},
      create: {
        id: userId,
        name: author?.trim() || null,
        email: `${userId}@local.fake`,
      },
    });

    const newComment = await prisma.comment.create({
      data: { content, blogId: id, userId },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    // Email the owner about the new comment (best-effort; never blocks the post).
    try {
      const owner = process.env.OWNER_EMAIL;
      if (owner && mailReady()) {
        const blog = await prisma.blog.findUnique({ where: { id }, select: { title: true, slug: true } });
        const alsoLiked = await prisma.vote.findUnique({ where: { userId_blogId: { userId, blogId: id } } });
        if (blog) {
          const who = author?.trim() || 'Anonymous';
          const postUrl = `${siteUrl()}/blogs/${blog.slug}#comments`;
          await sendMail({
            to: owner,
            subject: `New comment on “${blog.title}”`,
            html: emailShell(
              'New comment',
              `<p><strong style="color:#ece9e1">${escapeHtml(who)}</strong> left a comment${alsoLiked?.type === VoteType.UPVOTE ? ' <span style="color:#ed93b1">(also liked this post &#9829;)</span>' : ''} on <strong style="color:#ece9e1">${escapeHtml(blog.title)}</strong>:</p>
               <blockquote style="margin:14px 0;padding:12px 16px;border-left:3px solid #ed93b1;background:#0c0c0c;border-radius:4px;color:#c9c9bf;white-space:pre-wrap">${escapeHtml(content)}</blockquote>
               <p>${btn(postUrl, 'View on the post →')}</p>`,
              'You receive these because OWNER_EMAIL is set on your site.'
            ),
            text: `${who} commented on ${blog.title}:\n\n${content}\n\n${postUrl}`,
          });
        }
      }
    } catch (e) {
      console.error('[comment notify]', e);
    }

    const response = NextResponse.json({ ...newComment, userId }, { status: 201 });
    if (isNew) setCookieOnResponse(response, userId);
    return response;
  } catch (error) {
    console.error('[POST /api/blogs/[id]/comments]', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
