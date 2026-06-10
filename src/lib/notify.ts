// src/lib/notify.ts — email all confirmed subscribers about a post.
import { prisma } from '@/lib/prisma';
import { sendMail, mailReady, subToken, siteUrl, emailShell, btn, escapeHtml } from '@/lib/mailer';

export type NotifyResult = { ok: boolean; status?: number; error?: string; post?: string; subscribers?: number; sent?: number };

export async function notifySubscribers(slug?: string): Promise<NotifyResult> {
  if (!mailReady()) return { ok: false, status: 503, error: 'SMTP not configured.' };

  const blog = slug
    ? await prisma.blog.findUnique({ where: { slug } })
    : await prisma.blog.findFirst({ where: { published: true }, orderBy: { createdAt: 'desc' } });

  if (!blog || !blog.published) return { ok: false, status: 404, error: 'No published post found.' };

  const subs = await prisma.subscriber.findMany({ where: { confirmed: true } });
  const postUrl = `${siteUrl()}/blogs/${blog.slug}`;

  const sendOne = (s: { email: string; name: string | null }) => {
    const unsub = `${siteUrl()}/api/subscribe/unsubscribe?email=${encodeURIComponent(s.email)}&token=${subToken(s.email, 'unsub')}`;
    return sendMail({
      to: s.email,
      subject: `New post — ${blog.title}`,
      html: emailShell(
        'New post',
        `<p>Hi${s.name ? ' ' + escapeHtml(s.name) : ''},</p>
         <p>I just published something new:</p>
         <p style="font-size:18px;color:#ece9e1;font-weight:600;margin:14px 0 4px">${escapeHtml(blog.title)}</p>
         ${blog.description ? `<p style="color:#9b9b91;margin:0 0 18px">${escapeHtml(blog.description)}</p>` : ''}
         <p>${btn(postUrl, 'Read it →')}</p>`,
        `You're subscribed to my writing. <a href="${unsub}" style="color:#8a8a82">Unsubscribe</a>.`,
      ),
      text: `New post: ${blog.title}\n${postUrl}\n\nUnsubscribe: ${unsub}`,
    });
  };

  // Send in bounded batches so a large list never opens hundreds of sockets at once
  // or trips provider rate limits.
  const CONCURRENCY = Number(process.env.NOTIFY_CONCURRENCY || 10);
  let sent = 0;
  for (let i = 0; i < subs.length; i += CONCURRENCY) {
    const batch = subs.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map(sendOne));
    sent += results.filter((r: PromiseSettledResult<boolean>) => r.status === 'fulfilled' && r.value === true).length;
  }
  return { ok: true, post: blog.slug, subscribers: subs.length, sent };
}
