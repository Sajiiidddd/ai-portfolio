import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, ipOf } from '@/lib/ratelimit';
import { verifyTurnstile } from '@/lib/turnstile';
import { sendMail, mailReady, subToken, siteUrl, emailShell, btn, escapeHtml } from '@/lib/mailer';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { name, email, website, turnstileToken } = (await req.json().catch(() => ({}))) as {
      name?: unknown; email?: unknown; website?: unknown; turnstileToken?: string;
    };
    // Honeypot — bots fill this; pretend success so they don't probe.
    if (typeof website === 'string' && website.trim() !== '') return NextResponse.json({ ok: true });
    if (!(await rateLimit(`sub:${ipOf(req)}`, 5, 60_000))) {
      return NextResponse.json({ error: 'Too many requests — slow down.' }, { status: 429 });
    }
    if (!(await verifyTurnstile(turnstileToken, ipOf(req)))) {
      return NextResponse.json({ error: 'Verification failed — please retry.' }, { status: 403 });
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.length > 200) {
      return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 });
    }
    if (name != null && (typeof name !== 'string' || name.length > 80)) {
      return NextResponse.json({ error: 'Name too long.' }, { status: 400 });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (typeof name === 'string' ? name.trim() : '') || null;

    const existing = await prisma.subscriber.findUnique({ where: { email: cleanEmail } });
    if (existing?.confirmed) return NextResponse.json({ ok: true, already: true });

    await prisma.subscriber.upsert({
      where: { email: cleanEmail },
      update: cleanName ? { name: cleanName } : {},
      create: { email: cleanEmail, name: cleanName, confirmed: false },
    });

    const token = subToken(cleanEmail, 'confirm');
    const link = `${siteUrl()}/api/subscribe/confirm?email=${encodeURIComponent(cleanEmail)}&token=${token}`;
    if (mailReady()) {
      await sendMail({
        to: cleanEmail,
        subject: 'Confirm your subscription to Sajid’s writing',
        html: emailShell(
          'Confirm subscription',
          `<p>Hey${cleanName ? ' ' + escapeHtml(cleanName) : ''},</p>
           <p>You asked to get an email whenever I publish a new post. Tap below to confirm — if this wasn’t you, just ignore this.</p>
           <p style="margin-top:22px">${btn(link, 'Confirm subscription →')}</p>`,
          'You’re receiving this because this address was entered on my site.'
        ),
        text: `Confirm your subscription: ${link}`,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[POST /api/subscribe]', e);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
