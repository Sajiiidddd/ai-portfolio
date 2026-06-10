// src/lib/mailer.ts
// Email via Gmail SMTP (Nodemailer + an App Password). All sends are best-effort:
// if SMTP isn't configured (no creds in .env) we log and no-op so the app never
// breaks. Confirm/unsubscribe links are stateless HMAC tokens — no extra columns.
import crypto from 'crypto';
/* eslint-disable @typescript-eslint/no-explicit-any */

const SECRET = process.env.IDENTITY_SECRET || 'dev-only-secret--set-IDENTITY_SECRET';

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

type SubAction = 'confirm' | 'unsub';
export function subToken(email: string, action: SubAction): string {
  return crypto.createHmac('sha256', SECRET).update(`${action}:${email.toLowerCase()}`).digest('hex').slice(0, 40);
}
export function verifySubToken(email: string, action: SubAction, token: string): boolean {
  if (!email || !token) return false;
  const expected = Buffer.from(subToken(email, action));
  const given = Buffer.from(token);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

export function mailReady(): boolean {
  return !!(process.env.RESEND_API_KEY || (process.env.SMTP_USER && process.env.SMTP_PASS));
}

let _resend: any = null;
async function resendClient(): Promise<any> {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  try { const { Resend } = await import('resend'); _resend = new Resend(key); return _resend; }
  catch { return null; }
}

let _t: any = null;
async function transport(): Promise<any> {
  if (_t) return _t;
  if (!(process.env.SMTP_USER && process.env.SMTP_PASS)) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  try {
    const nodemailer = (await import('nodemailer')).default;
    _t = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port, secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return _t;
  } catch { return null; }
}

export async function sendMail(opts: { to: string; subject: string; html: string; text?: string }): Promise<boolean> {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'onboarding@resend.dev';

  // Prefer Resend (better deliverability at scale) when an API key is present.
  const r = await resendClient();
  if (r) {
    try {
      const { error } = await r.emails.send({ from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text ?? '' });
      if (error) throw error;
      return true;
    } catch (e) { console.error('[mailer:resend] send failed:', e); return false; }
  }

  // Fall back to Gmail SMTP.
  const t = await transport();
  if (!t) { console.warn('[mailer] no provider configured — skipping email to', opts.to); return false; }
  try {
    await t.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text });
    return true;
  } catch (e) {
    console.error('[mailer:smtp] send failed:', e);
    return false;
  }
}

/** Shared dark, on-brand email shell. `bodyHtml` is trusted (caller-built); escape user input before passing in. */
export function emailShell(eyebrow: string, bodyHtml: string, footer?: string): string {
  return `<!doctype html><html><body style="margin:0;background:#0a0a0a;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#ece9e1">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
  <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#111111;border:1px solid rgba(236,233,225,0.12);border-radius:12px;overflow:hidden">
    <tr><td style="height:4px;background:linear-gradient(90deg,#7d7d75,#ece9e1,#9aa0a6,#ece9e1,#7d7d75)"></td></tr>
    <tr><td style="padding:28px 30px">
      <div style="font:600 11px/1 'JetBrains Mono',monospace;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a82">${eyebrow}</div>
      <div style="margin-top:16px;font-size:15px;line-height:1.7;color:#c9c9bf">${bodyHtml}</div>
      ${footer ? `<div style="margin-top:26px;padding-top:16px;border-top:1px solid rgba(236,233,225,0.1);font:400 11px monospace;color:#8a8a82">${footer}</div>` : ''}
    </td></tr>
  </table>
  <div style="margin-top:14px;font:400 10px monospace;letter-spacing:0.1em;color:#3a3a36">SAJID TAMBOLI &middot; PUNE, IN</div>
  </td></tr></table></body></html>`;
}

export function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#ece9e1;color:#0a0a0a;text-decoration:none;font:600 12px monospace;letter-spacing:0.12em;text-transform:uppercase;padding:12px 20px;border-radius:5px">${label}</a>`;
}
