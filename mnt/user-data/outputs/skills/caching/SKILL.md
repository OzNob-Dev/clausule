---
name: caching
description: >
  Principal guidance for caching strategy, Redis/Upstash patterns, cache invalidation,
  cache stampede prevention, TTL design, layered caching, and what to cache vs not.
  Load when designing caching for any feature, reviewing cache usage, implementing
  Redis patterns, or debugging cache-related performance issues.
---

# Caching — Principal Standards

## Philosophy
- **Cache is a performance optimization, never the source of truth.** DB is truth. Cache is approximate.
- **Wrong cache is worse than no cache.** Stale data causes bugs. Design invalidation before caching.
- **Measure first.** Cache the bottleneck, not everything.
- **Every cache has a cost.** Complexity, memory, invalidation bugs, consistency problems.

## When to Cache
```
CACHE:
  ✓ Expensive DB queries run frequently with rarely-changing data
  ✓ External API calls with rate limits (exchange rates, geocoding)
  ✓ Session/auth data accessed on every request
  ✓ Computed aggregates (user stats, leaderboards)
  ✓ Static-ish reference data (feature flags, config, country lists)
  ✓ Rate limit counters

DO NOT CACHE:
  ✗ Data that must be strongly consistent (payment state, inventory)
  ✗ User-specific data without isolation (cache poisoning risk)
  ✗ Data that changes on every write
  ✗ Anything you haven't profiled as a bottleneck
  ✗ Auth credentials or tokens (security risk)
```

## Cache Layers
```
Browser cache       → Static assets, CDN-served responses (Cache-Control headers)
CDN / Edge          → Page-level, API responses (Vercel Edge Cache, Cloudflare)
Next.js fetch cache → Server-side fetch() with revalidation tags
React Query         → Client-side server state (staleTime, gcTime)
Redis / Upstash     → Application-level, distributed, shared across instances
In-memory (Node)    → Request-scoped only, never across requests
```

## Redis Patterns (Upstash)

```typescript
// src/shared/utils/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  // Try cache first
  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;

  // Cache miss — fetch and store
  const data = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}

export async function invalidateCache(key: string): Promise<void> {
  await redis.del(key);
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  // Use with caution on large keyspaces — SCAN, not KEYS
  let cursor = 0;
  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
    if (keys.length > 0) await redis.del(...keys);
    cursor = Number(nextCursor);
  } while (cursor !== 0);
}
```

## Cache Key Design
```typescript
// Namespaced, versioned, deterministic
const CACHE_KEYS = {
  user: (id: string) => `v1:user:${id}`,
  userPosts: (userId: string, page: number) => `v1:user:${userId}:posts:${page}`,
  featureFlags: () => `v1:feature-flags`,
  leaderboard: (period: string) => `v1:leaderboard:${period}`,
  rateLimit: (userId: string, action: string) => `rl:${action}:${userId}`,
} as const;

// Rules:
// - Prefix with version (v1:) — bump version to invalidate entire namespace
// - Include all dimensions that make data unique (userId, page, filter)
// - Separate rate limit keys from data keys (rl: prefix)
// - No special characters except : and -
// - Keep keys under 100 chars
```

## TTL Design
```
Auth sessions:          1h - 24h (match session lifetime)
User profile:           5m (changes infrequently, stale is OK briefly)
Feature flags:          1m (fast propagation needed)
Leaderboards:           30s (acceptable lag for real-time feel)
Exchange rates:         5m (external API rate limit friendly)
Static reference data:  1h (countries, currencies, timezones)
Rate limit counters:    Match window size exactly (60s for per-minute limit)
Aggregates/stats:       5m-1h depending on accuracy requirement
```

Never set TTL=0 (no expiry) for application data. Everything expires.

## Cache Invalidation Strategies

### Write-Through (Recommended for consistency)
```typescript
async function updateUser(userId: string, data: UpdateUserInput): Promise<User> {
  // Write to DB first
  const user = await userRepo.update(userId, data);
  // Immediately invalidate (or update) cache
  await invalidateCache(CACHE_KEYS.user(userId));
  return user;
}
```

### Tag-Based Invalidation (Next.js)
```typescript
// Cache with tags
const user = await fetch(`/api/users/${id}`, {
  next: { tags: [`user:${id}`, 'users'], revalidate: 300 }
});

// Invalidate by tag in server action
import { revalidateTag } from 'next/cache';
revalidateTag(`user:${userId}`);  // invalidates all fetches tagged with this user
```

### Cache Stampede Prevention
Problem: cache expires → 1000 simultaneous requests → 1000 DB queries.

```typescript
// Solution 1: Probabilistic early expiry (background refresh)
async function getCachedWithEarlyRefresh<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const result = await redis.get<{ data: T; expiresAt: number }>(key);

  if (result) {
    // Probabilistically refresh before expiry (last 10% of TTL)
    const timeLeft = result.expiresAt - Date.now() / 1000;
    const shouldRefresh = timeLeft < ttlSeconds * 0.1 && Math.random() < 0.1;
    if (shouldRefresh) {
      // Refresh in background, return stale data now
      fetcher().then(data => {
        redis.setex(key, ttlSeconds, JSON.stringify({ data, expiresAt: Date.now() / 1000 + ttlSeconds }));
      }).catch(() => {});
    }
    return result.data;
  }

  // Solution 2: Distributed lock on cache miss
  const lockKey = `lock:${key}`;
  const lockAcquired = await redis.set(lockKey, '1', { ex: 10, nx: true });

  if (lockAcquired) {
    try {
      const data = await fetcher();
      await redis.setex(key, ttlSeconds, JSON.stringify({ data, expiresAt: Date.now() / 1000 + ttlSeconds }));
      return data;
    } finally {
      await redis.del(lockKey);
    }
  } else {
    // Wait for lock holder to populate, then retry
    await sleep(50);
    return getCachedWithEarlyRefresh(key, fetcher, ttlSeconds);
  }
}
```

## Rate Limiting with Redis
```typescript
// Sliding window rate limiter
export async function checkRateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const key = CACHE_KEYS.rateLimit(identifier, action);
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Atomic sliding window with sorted set
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);         // remove old entries
  pipeline.zadd(key, { score: now, member: `${now}` });   // add current
  pipeline.zcard(key);                                     // count in window
  pipeline.expire(key, windowSeconds);                     // auto-cleanup

  const results = await pipeline.exec();
  const count = results[2] as number;
  const allowed = count <= limit;

  return {
    allowed,
    remaining: Math.max(0, limit - count),
    resetAt: new Date(now + windowSeconds * 1000),
  };
}
```

## Cache Warming
For data that must be fast from cold start:

```typescript
// Warm critical caches on startup or after deploy
export async function warmCaches(): Promise<void> {
  await Promise.allSettled([
    getCached(CACHE_KEYS.featureFlags(), fetchFeatureFlags, 60),
    getCached(CACHE_KEYS.leaderboard('weekly'), fetchWeeklyLeaderboard, 30),
  ]);
}
```

## Multi-Tenancy Cache Isolation
```typescript
// Always include tenant/org ID in key — never share data across tenants
const CACHE_KEYS = {
  orgSettings: (orgId: string) => `v1:org:${orgId}:settings`,
  orgMembers: (orgId: string) => `v1:org:${orgId}:members`,
};

// On org switch or data change, invalidate org-scoped keys
await invalidateCachePattern(`v1:org:${orgId}:*`);
```

## Anti-Patterns (Instant Rejection)
- `KEYS *` in production (blocks Redis, use SCAN)
- No TTL on cached data
- Caching auth tokens or credentials
- Caching user A's data without user ID in key (cache poisoning)
- Invalidating by pattern on hot paths (expensive)
- No stampede protection on high-traffic keys
- Treating cache as source of truth (skipping DB)
- Caching errors or empty results without short TTL
- No version prefix (can't invalidate namespace cleanly)
- Caching before measuring that it's actually needed
