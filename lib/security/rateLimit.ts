/**
 * Sliding-window rate limiter with automatic backend selection.
 *
 * Production (multi-instance): configure UPSTASH_REDIS_URL + UPSTASH_REDIS_TOKEN
 *   env vars — the limiter will use Upstash Redis so limits survive restarts
 *   and work across all server instances.
 *
 * Development / single-node: no env vars needed — falls back to an in-memory
 *   store (identical API, but resets on restart and is local-only).
 */

interface Entry {
  hits: number[];
}

// ── In-memory backend (fallback) ──────────────────────────────────────────
const memStore = new Map<string, Entry>();
let lastSweep = Date.now();
function sweep(windowMs: number) {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, v] of memStore) {
    v.hits = v.hits.filter((t) => now - t < windowMs);
    if (v.hits.length === 0) memStore.delete(k);
  }
}

function memSlidingWindow(key: string, limit: number, windowMs: number): RateLimitResult {
  sweep(windowMs);
  const now = Date.now();
  const entry = memStore.get(key) ?? { hits: [] };
  entry.hits = entry.hits.filter((t) => now - t < windowMs);

  if (entry.hits.length >= limit) {
    const oldest = entry.hits[0];
    memStore.set(key, entry);
    return { ok: false, remaining: 0, retryAfterSeconds: Math.ceil((windowMs - (now - oldest)) / 1000) };
  }

  entry.hits.push(now);
  memStore.set(key, entry);
  return { ok: true, remaining: limit - entry.hits.length, retryAfterSeconds: 0 };
}

// ── Upstash Redis backend (production) ────────────────────────────────────
async function redisSlidingWindow(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL!,
    token: process.env.UPSTASH_REDIS_TOKEN!,
  });

  const now = Date.now();
  const windowStart = now - windowMs;

  // Remove expired entries and add the current hit in one atomic operation
  const multi = redis.multi();
  multi.zremrangebyscore(key, 0, windowStart);
  multi.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  multi.zcard(key);
  multi.expire(key, Math.ceil(windowMs / 1000));
  const [, , count] = (await multi.exec()) as [unknown, unknown, number];

  if (count > limit) {
    const oldest = await redis.zrange(key, 0, 0, { withScores: true });
    const oldestTime = Array.isArray(oldest) && oldest.length > 1 ? (oldest[1] as number) : now;
    return { ok: false, remaining: 0, retryAfterSeconds: Math.ceil((windowMs - (now - oldestTime)) / 1000) };
  }

  return { ok: true, remaining: limit - count, retryAfterSeconds: 0 };
}

// ── Public API ────────────────────────────────────────────────────────────

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const USE_REDIS = !!(process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN);

/**
 * @param key    unique bucket (e.g. `signup:1.2.3.4`)
 * @param limit  max requests per window
 * @param windowMs window length in ms
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (USE_REDIS) {
    return redisSlidingWindow(key, limit, windowMs);
  }
  return memSlidingWindow(key, limit, windowMs);
}

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
