# Requirements

The packages this project depends on beyond a stock Next.js app. All are already
declared in `package.json`; this file is the human-readable checklist of what must be
installed (and why). To install everything in one go:

```
npm install
```

---

## Newly added (cause the current `Module not found` build errors until installed)

### Runtime dependencies

| Package | Version | Purpose |
|---|---|---|
| `nodemailer` | ^7.0.13 | Gmail SMTP email sending (mailer fallback) |
| `resend` | ^4.0.0 | Resend email provider (preferred when `RESEND_API_KEY` is set) |
| `@upstash/ratelimit` | ^2.0.3 | Durable, global rate limiting |
| `@upstash/redis` | ^1.34.0 | Upstash Redis client used by the limiter |

Install just these to unblock the build:

```
npm install nodemailer resend @upstash/ratelimit @upstash/redis
```

### Dev dependencies

| Package | Version | Purpose |
|---|---|---|
| `@types/nodemailer` | ^6.4.15 | TypeScript types for nodemailer |
| `@playwright/test` | ^1.48.0 | End-to-end tests (`npm run e2e`) |

```
npm install -D @types/nodemailer @playwright/test
```

Playwright also needs its browser once (not an npm package):

```
npx playwright install --with-deps chromium
```

---

## Core stack (already present in `package.json`)

- **next**, **react**, **react-dom** — framework
- **typescript**, **@types/react**, **@types/node** — types/tooling
- **prisma**, **@prisma/client** — database ORM (run `npx prisma generate` after install; this also runs via `postinstall`)
- **ts-node** — runs the Prisma seed
- **framer-motion**, **react-markdown**, **remark-gfm** — UI / blog rendering
- Tailwind + PostCSS — styling

---

## System / external (not npm)

- **Node 20+**, **npm**
- **PostgreSQL** (via Docker `npm run db:up`, or native) — `DATABASE_URL`
- Optional third-party accounts (see `docs/INTEGRATIONS.md`): Resend, Cloudflare Turnstile, Upstash Redis

> Full setup order is in `DEPLOYMENT.md`.
