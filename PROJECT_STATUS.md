# Portfolio — Feature Status & Setup

_Feature-level companion to `DEPLOYMENT.md` (full runbook), `docs/INTEGRATIONS.md`
(third-party setup), `SETUP.md` (dev/infra), and `REQUIREMENTS.md` (packages)._

---

## 1. What's done

### Writing / blog
- New post **"From an Award-Winning Final-Year Project to Enterprise MCP"**
  (`prisma/seed-content/from-fyp-to-enterprise-mcp.md` + seed entry). Timeline corrected.
- Experience titles **re-scramble every time** they scroll into view.

### Comments & engagement
- Comments **open by default**.
- **Comment likes (hearts)** — `CommentLike`, one per identity per comment.
- **Like ↔ comment mapping** — a "♥ liked" chip on commenters who also liked the post.
- **Moderation** — `Comment.hidden`; hidden comments excluded from the public view.

### Subscriptions & email
- **Double opt-in** subscribe form + confirm/unsubscribe.
- **New-post blast** (`/api/notify`, secret-guarded; batched with `NOTIFY_CONCURRENCY`).
- **Owner email on every new comment**.
- **Resend** provider (preferred) with **Gmail SMTP** fallback (`src/lib/mailer.ts`).

### SEO & discoverability
- `sitemap.ts`, `robots.ts`, RSS `feed.xml`, rich metadata + canonicals, **dynamic OG
  images** (`next/og`), JSON-LD (Person/WebSite/BlogPosting). `src/lib/site.ts` resolves `SITE_URL`.

### Portfolio agent, recommendations & admin overview (live)
- **Portfolio agent** — home hero is a flip card (Developer Pass ⇄ agent). `POST /api/ask`
  answers from `content/agent/*.md` + public **GitHub READMEs** (`src/lib/github.ts`,
  cached 6h) + recent blog posts (`src/lib/agentContext.ts`) via free **Gemini**
  (`GEMINI_API_KEY`); canned fallback with no key. Questions logged to `AgentQuery`.
- **Recommendations** (`/recommendations`) — "ON ROTATION" leaderboard game: 3 movies +
  3 songs per visitor (cookie identity), name required, edit/remove/swap, like/dislike
  voting, pole-position top-3. TMDB/Spotify power search.
- **Admin** (`/admin`, password-gated) — opens on an **Overview** dashboard (stat cards,
  14-day subscriber sparkline, agent insights + most-asked questions, top posts, recent
  activity), plus tabs: **Posts** (create/edit/publish/delete + Notify), **Subscribers**
  (list/remove/CSV), **Comments** (hide/delete), **Questions** (what people asked). Inline
  charts, no new deps. Proper confirm cards for destructive actions.

### Hardening & scale (optional, graceful)
- **Cloudflare Turnstile** on subscribe/comment/login (active only when keys set).
- **Upstash Redis** durable rate limiting (in-memory fallback).
- **Optional deps are lazy** (`next.config.js` `serverExternalPackages`): the build runs
  without `nodemailer`/`resend`/`@upstash/*` installed; they activate when env keys exist.

### Health, CI, accessibility, Blips
- **Recommendations revived** (Prisma models), **framer-motion typing fixed** — build green.
- **CI** (`.github/workflows/ci.yml`): typecheck + lint + build, plus a Postgres-backed
  **e2e** job (`prisma db push` + seed + Playwright).
- **Accessibility** (rounds 1 & 2): skip link, focus rings, `prefers-reduced-motion`,
  coarse-pointer cursor fallback, AA muted text, single `<main>`, nav labelled,
  horizontal-overflow guard. Remaining: a screen-reader walkthrough on real AT.
- **Blips** parked in `blips/` with a ship-it-back README.

---

## 2. Set up & run

**One time:**
```
npm install
```
Create a Gmail App Password (or skip email), fill `.env` from `.env.example`, then:
```
npx prisma migrate dev
npm run db:seed
npm run dev
```
`migrate dev` creates all current tables/columns: `CommentLike`, `Subscriber`,
`Comment.hidden`, `Recommendation`, `RecommendationVote`, `AgentQuery`. Re-run it any
time `schema.prisma` changes; commit `prisma/migrations/`.

**Env (required):** `DATABASE_URL`, `NEXT_PUBLIC_BASE_URL`, `IDENTITY_SECRET`,
`ADMIN_PASSWORD`. **Optional:** email (`RESEND_API_KEY` or `SMTP_*` + `MAIL_FROM` +
`OWNER_EMAIL` + `NOTIFY_SECRET`), agent (`GEMINI_API_KEY`, `GEMINI_MODEL`,
`GITHUB_USERNAME`, `GITHUB_TOKEN`), recommendations search (`TMDB_API_KEY`,
`SPOTIFY_CLIENT_ID/SECRET`), Turnstile, Upstash. Full table in `DEPLOYMENT.md` §4.

**Publish a post:** go to `/admin`, log in (`ADMIN_PASSWORD`), New post → write Markdown →
Publish → Notify. `prisma/seed.ts` only bootstraps a fresh DB.

**Deploy:** Vercel + managed Postgres (Neon), set env, Build Command
`npx prisma migrate deploy && npm run build`. Full steps in `DEPLOYMENT.md` §10.

---

## 3. Data model (Prisma)

`Blog`, `Comment` (+`hidden`), `CommentLike`, `Vote`, `Subscriber`, `Recommendation`,
`RecommendationVote`, `AgentQuery`, `User`. All engagement is persisted in Postgres and
shared globally (see "identity" note below).

**Identity:** anonymous `user_id` cookie + HMAC sig (no login). Comments/votes/likes/recs
and the 3-pick cap are tied to the cookie — clearing it = new identity.

---

## 4. New API surface

| Method + path | Purpose | Auth |
|---|---|---|
| `POST /api/ask` | Portfolio agent answer (Gemini + fallback) | rate-limited |
| `POST /api/subscribe` · `GET …/confirm` · `GET …/unsubscribe` | Double opt-in | token |
| `POST /api/notify` | New-post email blast | `NOTIFY_SECRET` |
| `POST /api/blogs/[id]/comments/[commentId]/like` | Comment heart | identity cookie |
| `GET/POST /api/recommendations` · `PATCH/DELETE /api/recommendations/[id]` · `POST …/vote` | Recs game | cookie |
| `/api/admin/login`·`logout`·`blogs`·`blogs/[id]`·`notify`·`subscribers`·`comments`·`agent-queries`·`overview` | Admin | session cookie |

---

## 5. What to work on next

- **Accessibility** — a real screen-reader walkthrough; tap-target polish on phones.
- **Mobile** — a device-verified pass at 375–414px per page (structurally responsive now).
- **Identity** — optional magic-link/Google login so picks survive cookie clears (deferred).
- **Email at scale** — batched already; queue for very large lists.
- **Traffic analytics** — pageviews via Vercel Analytics or a view-log table (engagement is in-DB; traffic is not).
- **Agent-question logging** — add an admin export / theming of common questions.
