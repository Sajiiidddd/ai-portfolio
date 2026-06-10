# Integrations & third-party setup

Every integration here is **optional and graceful** — if its env vars are unset, the
app falls back (in-memory rate limiting, Gmail SMTP, no bot check) and nothing breaks.
Add the keys when you want the upgrade. All have free tiers.

After editing `.env`, **restart the dev server** (env changes don't hot-reload).

---

## 1. Resend — email at scale

Better deliverability than Gmail SMTP and no daily send caps. When `RESEND_API_KEY`
is set it takes priority over SMTP; otherwise Gmail SMTP is used.

1. Sign up at https://resend.com (free tier: 3,000 emails/mo, 100/day).
2. **Add & verify a domain** (Resend → Domains → Add). Add the DNS records it shows
   (SPF/DKIM) at your domain registrar. Verification takes a few minutes.
   - No domain yet? You can test immediately with the sender `onboarding@resend.dev`,
     but production should use your own domain for deliverability.
3. Create an API key (Resend → API Keys → Create).
4. In `.env`:
   ```
   RESEND_API_KEY="re_xxxxxxxx"
   MAIL_FROM="Sajid Tamboli <hello@yourdomain.com>"   # must be on the verified domain
   OWNER_EMAIL="you@wherever.com"                      # where comment alerts go
   ```
5. Restart. Subscribe/notify/comment emails now route through Resend automatically.

> Falls back to Gmail SMTP (`SMTP_*`) if `RESEND_API_KEY` is absent.

---

## 2. Cloudflare Turnstile — free bot protection

A privacy-friendly CAPTCHA alternative on the **subscribe, comment, and admin-login**
forms. Disabled (forms work normally) until both keys are set.

1. Cloudflare dashboard → **Turnstile** → Add site (https://dash.cloudflare.com/?to=/:account/turnstile). Free.
2. Add your domain(s) — include `localhost` for local testing.
3. Copy the **Site Key** and **Secret Key**. In `.env`:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAAA..."
   TURNSTILE_SECRET_KEY="0x4AAAAAAA..."
   ```
4. Restart. A widget appears on the three forms; the server verifies the token.

> **For Playwright/e2e**, either leave Turnstile unset, or use Cloudflare's
> always-passing test keys: site `1x00000000000000000000AA`,
> secret `1x0000000000000000000000000000000AA`.

---

## 3. Upstash Redis — durable rate limiting

The in-memory limiter is per serverless instance (not globally exact). Upstash makes
it global and durable. Used automatically when both vars are set.

1. Sign up at https://upstash.com (free tier: 10k commands/day).
2. Create a **Redis** database (any region near your Vercel region).
3. On the database page, copy the **REST URL** and **REST TOKEN** (the `UPSTASH_REDIS_REST_*`
   values, not the `redis://` URL). In `.env`:
   ```
   UPSTASH_REDIS_REST_URL="https://xxxx.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="AxxxASQ..."
   ```
4. Restart. All limiters (comments, votes, likes, subscribe, admin login) now share
   one global window. Falls back to in-memory if Redis is unreachable.

---

## 4. Playwright — end-to-end tests

Covers the smoke pages, SEO routes, the comment + like flow, the subscribe flow, and
the admin gate.

1. Install browsers once: `npx playwright install --with-deps chromium`
2. Make sure a local DB is up and seeded (`npm run db:seed`) so there's a post to act on.
3. Run **with Turnstile disabled** (unset its env, or use the test keys above):
   ```
   npm run e2e
   ```
   or `npm run e2e:ui` for the interactive runner.

Notes:
- The config auto-starts the app (`next dev` locally, `build && start` in CI).
- Tests skip gracefully when there's no seeded post / no subscribe form.
- Email *sending* isn't asserted (no inbox in CI) — the flows assert the API/UI
  results instead.

---

## Vercel: where to put these

Add every key above in **Vercel → Project → Settings → Environment Variables**
(Production + Preview), then redeploy. `NEXT_PUBLIC_*` keys are exposed to the browser
by design (that's required for the Turnstile widget); all others stay server-only.
Also set `NEXT_PUBLIC_BASE_URL`, `IDENTITY_SECRET`, `NOTIFY_SECRET`, and `ADMIN_PASSWORD`.

---

## 5. Portfolio agent — free Gemini + GitHub READMEs

The hero's "ask the pass anything" agent. Grounded on three sources, assembled in
`src/lib/agentContext.ts` and answered by `POST /api/ask`:

1. **Curated markdown** — `content/agent/*.md` (about, experience, projects, faq). Edit
   these to control the agent's facts and voice; they're the source of truth.
2. **GitHub READMEs** — `src/lib/github.ts` fetches your public repos' READMEs (cached
   6h) so every push is automatically answerable.
3. **Blog posts** — recent published posts are pulled from the DB.

### Setup

1. Get a **free Gemini API key** at https://aistudio.google.com/app/apikey (Google AI
   Studio — free tier, generous limits). In `.env`:
   ```
   GEMINI_API_KEY="AIza..."
   GEMINI_MODEL="gemini-2.0-flash"
   GITHUB_USERNAME="Sajiiidddd"
   ```
2. (Optional) `GITHUB_TOKEN` — a fine-grained PAT raises the GitHub rate limit
   (60→5000/hr). Not required for normal traffic since READMEs are cached.

### Notes

- **No training, no vector DB** — your content is small, so it's all stuffed into
  Gemini's context with a "answer only from this" system prompt.
- **Graceful fallback** — with no `GEMINI_API_KEY`, `/api/ask` returns `{fallback:true}`
  and the hero uses its built-in canned answers (free, never breaks).
- **Protected** — `/api/ask` uses the Upstash limiter + Turnstile, so the free quota
  can't be drained by bots.
- **Privacy** — the free Gemini tier may use prompts to improve their models, so only
  public info about you goes in the context files.

### Test it

```
curl -X POST "$NEXT_PUBLIC_BASE_URL/api/ask" -H "Content-Type: application/json" -d '{"question":"What is the patent?"}'
```
