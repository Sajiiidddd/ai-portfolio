# Portfolio — Setup & Go-Live Runbook

End-to-end guide: clone on a fresh machine → run locally → deploy to production.
Stack: **Next.js 15 · React 19 · Prisma 6 · PostgreSQL** (local native/Docker for dev, Neon for prod).

---

## 0. One-time step on the CURRENT machine (before you clone anywhere)

The performance indexes were added to `prisma/schema.prisma` but the migration
file hasn't been generated yet. Generate and commit it so every future machine
gets it automatically:

```bash
npx prisma migrate dev --name perf_indexes_and_hardening
git add prisma/migrations && git commit -m "perf indexes + hardening migration"
```

---

## 1. Prerequisites (new machine)

| Tool | Version | Check |
|---|---|---|
| Node.js | 20+ (LTS) | `node -v` |
| npm | 10+ | `npm -v` |
| PostgreSQL | 16 (native **or** Docker) | `psql --version` / `docker -v` |
| Git | any recent | `git -v` |

macOS Postgres options: `brew install postgresql@16 && brew services start postgresql@16`,
or [Postgres.app](https://postgresapp.com), or Docker Desktop (compose file included).

---

## 2. Clone & install

```bash
git clone https://github.com/Sajiiidddd/ai-portfolio.git
cd ai-portfolio
npm install          # postinstall runs `prisma generate` automatically
```

---

## 3. Environment

```bash
cp .env.example .env
```

Then edit `.env`:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | See §4 — **the username is machine-specific** for native Postgres |
| `IDENTITY_SECRET` | ✅ | Signs the anonymous identity cookie. Generate: `openssl rand -hex 32` |
| `NEXT_PUBLIC_BASE_URL` | ✅ | `http://localhost:3000` locally; your domain in prod |
| `TMDB_API_KEY`, `OMDB_API_KEY`, `SPOTIFY_*` | optional | Only used by legacy recommendation API routes (pages retired) |

> ⚠️ `.env` is gitignored — never commit it. Next.js reads it **only at server
> start**: after any change, fully stop and rerun `npm run dev`.

---

## 4. Database — pick ONE path

### Path A · Native local Postgres (what we use on the Mac)

The default superuser is **your OS username** (no password). Set in `.env`:

```bash
# find your username:  whoami
DATABASE_URL="postgresql://<your-username>@localhost:5432/portfolio?schema=public"
```

```bash
npm run db:create     # creates the `portfolio` database (createdb, psql fallback)
npm run db:migrate    # replays the full migration history
npm run db:seed       # inserts the seed blog post (idempotent, localhost-only)
```

### Path B · Docker (requires Docker Desktop with compose v2)

```bash
DATABASE_URL="postgresql://portfolio:portfolio@localhost:5432/portfolio?schema=public"
```

```bash
npm run db:up         # postgres:16-alpine, healthcheck, persistent volume
npm run db:migrate
npm run db:seed
```

### DB command reference

| Command | What it does |
|---|---|
| `npm run db:create` | Create the local `portfolio` database (native PG) |
| `npm run db:up` / `db:down` | Start/stop the Docker Postgres |
| `npm run db:migrate` | `prisma migrate dev` — apply/generate migrations |
| `npm run db:seed` | Seed content (refuses non-localhost unless `FORCE_SEED=1`) |
| `npm run db:studio` | Prisma Studio GUI to browse/edit data |

---

## 5. Run & verify locally

```bash
npm run dev           # http://localhost:3000
```

Verification checklist:

- [ ] `/` — About-index: hero + Developer Pass (hide toggle), Experience, Selected Work (motifs on hover), Research & IP, Impact, Writing teaser
- [ ] `/projects` — 10 projects, animated previews, drawer with links
- [ ] `/toolkit` — 44 tools (4 tiers) + certifications with Verify links
- [ ] `/blogs` — featured post; article page: entry animation, scroll-reveal, reading HUD, motif hero
- [ ] Vote ▲ — instant (optimistic), survives refresh
- [ ] Comment post/edit/delete — instant; Edit/Delete visible only on your own
- [ ] `/contact` — intent form composes a mailto draft
- [ ] Old URLs redirect: `/about` `/experience` `/test` → `/`; `/skills` `/certifications` → `/toolkit`

---

## 6. Go-live (Vercel + Neon)

### 6.1 Database (Neon)

1. Create/reuse a Neon project — **same region as your Vercel functions** (mismatched regions = latency on every query).
2. Copy the **pooled** connection string (host contains `-pooler`).
3. Apply migrations to production (from your machine):

```bash
DATABASE_URL="<neon-pooled-url>" npx prisma migrate deploy
```

4. Seed production (only if you want the seed post there — guard requires the override):

```bash
DATABASE_URL="<neon-pooled-url>" FORCE_SEED=1 npm run db:seed
```

### 6.2 Vercel environment variables (Settings → Environment Variables)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** URL |
| `IDENTITY_SECRET` | a fresh `openssl rand -hex 32` (different from dev is fine) |
| `NEXT_PUBLIC_BASE_URL` | `https://your-domain.com` |

### 6.3 Pre-deploy sanity

```bash
npm run build         # must complete locally before pushing
```

Push to the connected branch → Vercel builds & deploys. Re-run the §5 checklist
against the production URL.

### 6.4 Optional but recommended

- **Neon driver adapter** (faster cold starts): instructions are in the comment
  block inside `src/lib/prisma.ts` — `npm i @prisma/adapter-neon @neondatabase/serverless` + 5-line swap.
- **Backups**: Neon has point-in-time restore; for belt-and-braces,
  `pg_dump "$DATABASE_URL" > backup-$(date +%F).sql` on a schedule.
- **Rate limiting at scale**: the in-memory limiter is per-instance; swap the
  internals of `src/lib/ratelimit.ts` for Upstash Redis when traffic justifies it.

### External runtime dependencies (no keys needed)

| Service | Used by | If offline |
|---|---|---|
| Google Fonts (`fonts.googleapis.com`) | DotGothic16 / Space Grotesk / JetBrains Mono via `next/font` (fetched at build/dev compile, then self-hosted) | first compile needs internet; builds fail offline |
| Google favicon service (`google.com/s2/favicons`) | `/toolkit` Tools & Platforms tier (Docker, AWS, Claude, OpenAI, Slack, Zendesk, K8s, Argo, Azure, Jira, Postman icons) | icons render blank; swap to local files in `/public` if you want zero external calls |

---

## 6.5 Periodic maintenance

```bash
npx update-browserslist-db@latest   # silences the stale caniuse-lite warning in dev/build
npm outdated                        # review dependency drift occasionally
```

## 7. Troubleshooting

| Symptom | Cause → Fix |
|---|---|
| `P1010: User was denied access` | A local PG is running but the role/db in `DATABASE_URL` doesn't exist → fix username (§4A) and `npm run db:create` |
| `Environment variable not found: DATABASE_URL` | Dev server started before `.env` existed/changed → full restart (`Ctrl+C`, `npm run dev`) — HMR never reloads env |
| `unknown shorthand flag: 'd'` from docker | Old Docker CLI without compose v2 → use Path A (native) or update Docker Desktop |
| `createdb: command not found` | Postgres.app: use `/Applications/Postgres.app/Contents/Versions/latest/bin/createdb portfolio` |
| Prisma client out of date after pulling | `npx prisma generate` |
| Votes/comments 429 | Rate limiter working as intended (5 comments/min, 30 votes/min per IP) |
| Edit/Delete missing on old comments | Identity cookies are HMAC-signed now; pre-signing comments belong to a retired identity |
| Page styles look wrong on first dev load | DotGothic16 fetches from Google Fonts on first compile — needs internet once |

---

## 8. Architecture notes (for future-you)

- **Identity**: anonymous UUID in `user_id` (client-readable) + HMAC `user_sig`
  (httpOnly). One module: `src/lib/identity.ts`. No login by design.
- **Article pages**: ISR (60s) — the post body is cached; comments/votes hydrate
  client-side with optimistic updates, so the DB is never on the reader's
  critical path.
- **Seed**: idempotent upserts; refuses non-localhost without `FORCE_SEED=1`.
- **Motifs**: project animations live in each page's `motifEngine`; blog hero
  art is generated per-post, themed by tags, seeded by slug (`BlogMotif.tsx`).

- **Blips hero — PARKED (not on the site)**: removed from `src/app/page.tsx`;
  the whole project (React port `BlipsLayer.tsx` + `blipsEngine.ts`, plus the
  standalone `blips-playground.html` and `blips-hero.html`) now lives in the
  top-level `blips/` folder with a `README.md` explaining what it is and exactly
  how to ship it back in. `blips/` is in `tsconfig.json`'s `exclude` so it stays
  out of the build. The home page shows the Developer Pass normally again.
- **Comment likes (hearts)**: new `CommentLike` model (one heart per anonymous
  identity per comment, `@@unique([userId, commentId])`). Toggle endpoint
  `POST /api/blogs/[id]/comments/[commentId]/like` mirrors the votes route
  (rate-limited, can't like your own comment); the comments `GET` now folds in
  `likeCount` + `likedByMe`. UI: `BlogComments.tsx` renders an optimistic heart
  per comment and now **defaults to open** (visible by default; the collapse
  toggle stays). Requires a migration to create the table + regenerate the client:
  run `npx prisma migrate dev --name comment_likes` (local Postgres on localhost).

- **Email: subscriptions + notifications (Gmail SMTP)**: `src/lib/mailer.ts` wraps
  Nodemailer (Gmail SMTP via an App Password) with stateless HMAC confirm/unsubscribe
  tokens and a dark email template. All sends are best-effort — if SMTP env is unset,
  it logs and no-ops so nothing breaks.
  - **Subscribe (double opt-in)**: `SubscribeForm.tsx` on the Writing page →
    `POST /api/subscribe` (rate-limited + honeypot) creates an unconfirmed
    `Subscriber` and emails a confirm link → `GET /api/subscribe/confirm` flips
    `confirmed=true`; `GET /api/subscribe/unsubscribe` removes them. Both redirect
    back to `/blogs?subscribe=…` and the form shows the result.
  - **New-post blast**: `POST /api/notify` (guarded by `NOTIFY_SECRET`, sent as the
    `x-notify-secret` header or `{secret}` in the body). Body `{slug?}` — defaults to
    the newest published post. Emails every confirmed subscriber with an unsubscribe
    link. You call this when you publish.
  - **New-comment alert**: the comment `POST` emails `OWNER_EMAIL` with the author,
    the comment, the blog + a deep link, and a "(also liked this post ♥)" note when
    the same identity upvoted — best-effort, never blocks posting.

  **Setup (one time):**
  1. `npm install` (adds nodemailer + types)
  2. Create a Gmail App Password (needs 2FA on): https://myaccount.google.com/apppasswords
  3. Fill `.env` from `.env.example`: `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`,
     `OWNER_EMAIL`, `NOTIFY_SECRET`, and `NEXT_PUBLIC_BASE_URL`.
  4. `npx prisma migrate dev --name subscribers_and_comment_likes` (creates the
     `Subscriber` + `CommentLike` tables and regenerates the client).

  **Announce a new post:**
  `curl -X POST "$NEXT_PUBLIC_BASE_URL/api/notify" -H "x-notify-secret: YOUR_SECRET" -H "Content-Type: application/json" -d '{"slug":"from-fyp-to-enterprise-mcp"}'`
  (omit `slug` / send `{}` to blast the newest published post).
