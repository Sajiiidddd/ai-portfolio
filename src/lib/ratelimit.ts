// src/lib/ratelimit.ts
// Durable rate limiting via Upstash Redis when configured
// (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN); otherwise a per-instance
// in-memory sliding window. Upstash is OPTIONAL and lazy-loaded — the app builds and
// runs without the @upstash packages installed.

// ---- in-memory fallback (per serverless instance) ----
const store = new Map<string, number[]>();
function memLimit(key: string, limit: number, windowMs: number): boolean {
  if (store.size > 5000) store.clear();
  const now = Date.now();
  const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) { store.set(key, hits); return false; }
  hits.push(now); store.set(key, hits);
  return true;
}

// ---- Upstash (optional, lazy) ----
function upstashReady(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
/* eslint-disable @typescript-eslint/no-explicit-any */
let mods: any = null, redis: any = null;
const limiters = new Map<string, any>();
async function loadUpstash(): Promise<any> {
  if (mods) return mods;
  try {
    const [rl, rd] = await Promise.all([import('@upstash/ratelimit'), import('@upstash/redis')]);
    mods = { Ratelimit: rl.Ratelimit, Redis: rd.Redis };
    return mods;
  } catch { return null; }
}
async function getLimiter(limit: number, windowMs: number): Promise<any> {
  if (!upstashReady()) return null;
  const m = await loadUpstash();
  if (!m) return null;
  if (!redis) redis = m.Redis.fromEnv();
  const k = `${limit}:${windowMs}`;
  let rl = limiters.get(k);
  if (!rl) { rl = new m.Ratelimit({ redis, limiter: m.Ratelimit.slidingWindow(limit, `${windowMs} ms`), prefix: 'rl', analytics: false }); limiters.set(k, rl); }
  return rl;
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const rl = await getLimiter(limit, windowMs);
  if (rl) { try { const { success } = await rl.limit(key); return success; } catch { return memLimit(key, limit, windowMs); } }
  return memLimit(key, limit, windowMs);
}

export function ipOf(req: Request): string {
  return (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
}
