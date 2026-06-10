# Deployment & Setup — end to end

Everything needed to take this project from a fresh clone to a live production
deploy: local environment, database, third-party services, quality gates, and Vercel.

Companion docs: per-service detail in [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md),
dev/troubleshooting notes in [`SETUP.md`](SETUP.md), feature status in
[`PROJECT_STATUS.md`](PROJECT_STATUS.md).

---

## 0. Stack at a glance

- **Next.js 15** (App Router) + **TypeScript** + Tailwind / styled-jsx
- **PostgreSQL** via **Prisma** (blogs, comments, likes, votes, subscribers, recommendations)
- Anonymous identity: signed cookies (no login for visitors); a single shared password for `/admin`
- Email: **Resend** (preferred) or **Gmail SMTP** (fallback)
- Optional hardening: **Cloudflare Turnstile** (bot protection), **Upstash Redis** (durable rate limiting)
- Hosting: **Vercel**; CI: **GitHub Actions**; e2e: **Playwright**

> **Design principle:** every third-party integration is optional and degrades
> gracefully. With only `DATABASE_URL` set, the whole site runs locally — email,
> Turnstile, and Upstash simply no-op until you add their keys.

> **Optional dependencies are lazy + externalized.** `nodemailer`, `resend`,
> `@upstash/ratelimit`, and `@upstash/redis` are loaded only when their env keys are
> set (`next.config.js` → `serverExternalPackages`), so the app **builds and runs even
> if they aren't installed**. Install them (`npm install`) only when you actually want
> email or durable rate limiting in production. `nodemailer` is pinned to `^7.0.13`
> to match `next-auth`'s peer requirement.

---

## 1. Prerequisites

- **Node 20+** and **npm**
- **Docker Desktop** (easiest local Postgres) — or a native Postgres (Postgres.app / Homebrew)
- A **GitHub** account (for CI + Vercel import) and a **Vercel** account (free)

---

## 2. Clone & install

```
git clone <your-repo-url>
cd ai-portfolio-main
npm install
```

`npm install` runs `prisma generate` automatically (postinstall).

---

## 3. Local database

### Option A — Docker (recommended)

```
npm run db:up
```

This starts `postgres:16-alpine` (see `docker-compose.yml`) as `portfolio-db` on
port **5432** with user/password/db all `portfolio`, matching the default
`DATABASE_URL`. Stop it with `npm run db:down` (data persists in a volume).

### Option B — native Postgres (Postgres.app / Homebrew)

Create the database, then point `DATABASE_URL` at it:

```
createdb portfolio
```

(Postgres.app: `/Applications/Postgres.app/Contents/Versions/latest/bin/createdb portfolio`.)

---

## 4. Environment variables

Copy the template and fill it in:

```
cp .env.example .env
```

Generate the two secrets with:

```
openssl rand -hex 32
```

| Variable | Required? | What it is |
|---|---|---|
| `DATABASE_URL` | **Yes** | Postgres connection string (default matches the Docker DB) |
| `NEXT_PUBLIC_BASE_URL` | **Yes** | Site origin — `http://localhost:3000` locally; your domain in prod (drives links, sitemap, RSS, OG) |
| `IDENTITY_SECRET` | **Yes** | HMAC secret for anonymous identity + subscribe tokens (use `openssl rand -hex 32`) |
| `ADMIN_PASSWORD` | For `/admin` | Password for the publishing dashboard |
| `NOTIFY_SECRET` | For `/api/notify` | Guards the scriptable new-post blast (use `openssl rand -hex 32`) |
| `OWNER_EMAIL` | For comment alerts | Where new-comment notifications are sent |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` | For Gmail email | Gmail SMTP via an App Password |
| `RESEND_API_KEY` | Optional | Use Resend instead of SMTP (takes priority when set) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Optional | Cloudflare Turnstile bot protection |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional | Durable, global rate limiting |
| `GEMINI_API_KEY` / `GITHUB_USERNAME` | Optional | Portfolio agent (free Gemini) grounded on your MD + GitHub READMEs |
| `NOTIFY_CONCURRENCY` | Optional | Batch size for subscriber emails (default 10) |
| `TMDB_API_KEY` / `OMDB_API_KEY` / `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | Optional | Powers the `/recommendations` movie/song search |

> Restart the dev server after editing `.env` — env changes don't hot-reload.

---

## 5. Database schema & seed

Create/clear the tables and generate the client. The first run creates a migration
for the newest models/columns (`CommentLike`, `Subscriber`, `Comment.hidden`,
`Recommendation`, `RecommendationVote`, and `AgentQuery`) — **commit the generated
folder under `prisma/migrations/`.** Re-run `npx prisma migrate dev` any time you pull
changes that touched `schema.prisma`.

```
npx prisma migrate dev --name add_engagement_and_moderation
npm run db:seed
```

- `db:seed` is idempotent and refuses non-localhost databases unless `FORCE_SEED=1`.
- Inspect data anytime with `npm run db:studio`.

---

## 6. Run locally

```
npm run dev
```

Open http://localhost:3000. Quick smoke check:

- `/` (home), `/blogs`, `/projects`, `/toolkit`, `/contact`, `/recommendations`
- SEO routes: `/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/opengraph-image`
- `/admin` (after setting `ADMIN_PASSWORD`) — log in, create/publish a post

---

## 7. Third-party services (optional, free tiers)

Full step-by-step for each is in [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md). Summary:

- **Resend** (email at scale) — verify a domain, create an API key, set `RESEND_API_KEY` + `MAIL_FROM`. Falls back to Gmail SMTP if unset.
- **Gmail SMTP** (simple email) — enable 2FA, create an App Password (https://myaccount.google.com/apppasswords), set `SMTP_*` + `MAIL_FROM` + `OWNER_EMAIL`.
- **Cloudflare Turnstile** (bot protection on subscribe/comment/login) — create a Turnstile site, set both keys. Disabled until both are present.
- **Upstash Redis** (durable rate limiting) — create a Redis DB, set the two `UPSTASH_REDIS_REST_*` values. In-memory fallback otherwise.

---

## 8. Admin & publishing

1. Set `ADMIN_PASSWORD`, restart.
2. Go to **`/admin`**, log in.
3. **Posts** tab — create/edit (Markdown; `##` headings build the TOC), publish/draft, delete, and **Notify** confirmed subscribers.
4. **Subscribers** tab — list, remove, export CSV.
5. **Comments** tab — hide/unhide or delete (moderation).

Publishing happens entirely in `/admin` — `prisma/seed.ts` is only for bootstrapping a fresh DB.

---

## 9. Quality gates

```
npm run typecheck
npm run lint
npm run build
```

End-to-end (needs a seeded DB; run Turnstile-disabled or with Cloudflare test keys):

```
npx playwright install --with-deps chromium
npm run e2e
```

CI (`.github/workflows/ci.yml`) runs typecheck + lint + build, plus a separate **e2e**
job on a Postgres service container (`prisma db push` → seed → Playwright).

---

## 10. Deploy to Vercel

### 10a. Production database (free)

Use a managed Postgres — **Neon** (recommended), Supabase, or Vercel Postgres:

1. Create a project at https://neon.tech (free tier).
2. Copy the **pooled** connection string (ensure it ends with `?sslmode=require`).
3. You'll paste it as `DATABASE_URL` in Vercel (next step).

### 10b. Import the repo

1. Push to GitHub.
2. Vercel → **Add New → Project** → import the repo (framework auto-detected as Next.js).

### 10c. Environment variables (Vercel → Settings → Environment Variables)

Add, for **Production** (and Preview):

- `DATABASE_URL` (the Neon string), `NEXT_PUBLIC_BASE_URL` (your production URL),
  `IDENTITY_SECRET`, `ADMIN_PASSWORD`, `NOTIFY_SECRET`, `OWNER_EMAIL`
- Email: `RESEND_API_KEY` + `MAIL_FROM` (or the `SMTP_*` set)
- Optional: Turnstile keys, Upstash keys
- `NEXT_PUBLIC_*` keys are browser-exposed by design (required for the Turnstile widget)

### 10d. Apply migrations on deploy

Set the Vercel **Build Command** (Settings → General → Build & Development Settings) to:

```
npx prisma migrate deploy && npm run build
```

This applies committed migrations to the production DB on every deploy. (`prisma generate`
still runs via postinstall.)

### 10e. Deploy

Trigger a deploy (push to `main` or **Redeploy**). Verify the build logs show
`prisma migrate deploy` applying migrations, then open the production URL.

---

## 11. Post-deploy checklist

- Set `NEXT_PUBLIC_BASE_URL` to the real domain and redeploy so sitemap/RSS/OG emit absolute links.
- Submit `/sitemap.xml` in [Google Search Console](https://search.google.com/search-console) and [Bing Webmaster Tools](https://www.bing.com/webmasters).
- Preview a shared link with the [OpenGraph debugger](https://www.opengraph.xyz).
- Log into `/admin`, publish a post, and click **Notify** to confirm email delivery end-to-end.
- (If using Resend) confirm the sending domain is verified so mail lands in inboxes.

---

## 12. Troubleshooting

See the table in [`SETUP.md`](SETUP.md) (DATABASE_URL not found, Prisma client out of
date, rate-limit 429s, etc.). Common ones:

| Symptom | Fix |
|---|---|
| `Environment variable not found: DATABASE_URL` | `.env` missing/changed after dev start → full restart |
| Prisma type errors after pulling | `npx prisma generate` |
| `prisma migrate deploy` finds no migrations | Run `prisma migrate dev` locally first and commit `prisma/migrations/` |
| Emails not arriving | Check `RESEND_API_KEY`/`SMTP_*`; verify the Resend domain; check spam |
| Turnstile blocks e2e | Unset Turnstile env or use Cloudflare's test keys (see `docs/INTEGRATIONS.md`) |
