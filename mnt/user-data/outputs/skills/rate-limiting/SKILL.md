---
name: rate-limiting
description: >
  Principal guidance for rate limiting strategy, sliding window and token bucket algorithms,
  Redis-backed distributed limiters, per-user and per-IP limits, response headers,
  and abuse detection patterns. Load when implementing rate limits, reviewing API
  protection, or designing abuse prevention.
---

# Rate Limiting — Principal Standards

## Philosophy
- **Every public endpoint needs a rate limit.** No exceptions. Unprotected endpoints = free DoS.
- **Limits must be distributed.** In-memory limits are per-instance — useless behind load balancers.
- **Fail open on limiter errors.** If Redis is down, don't block all users — log and allow.
- **Tell clients what to expect.** Standard headers so clients can back off gracefully.

## Algorithm Selection
```
Sliding window    → Recommended for most use cases. Smooth limit, no burst exploits.
Token bucket      → Allows controlled bursts. Good for API clients with bursty patterns.
Fixed window      → Simplest. Vulnerable to boundary bursts (avoid for auth endpoints).
Leaky bucket      → Enforces steady rate. Good for queue-like processing.
```

Use **sliding window** as default. Token bucket for developer API keys that need burst allowance.

## Rate Limit Tiers
```typescript
export const RATE_LIMITS = {
  // Auth — strict, per IP (before user is known)
  login:              { requests: 5,    window: 60 },     // 5/min per IP
  register:           { requests: 3,    window: 60 },     // 3/min per IP
  passwordReset:      { requests: 3,    window: 3600 },   // 3/hr per IP
  emailVerification:  { requests: 5,    window: 3600 },   // 5/hr per user

  // API — per authenticated user
  apiWrite:           { requests: 30,   window: 60 },     // 30/min per user
  apiRead:            { requests: 100,  window: 60 },     // 100/min per user
  fileUpload:         { requests: 10,   window: 60 },     // 10/min per user

  // Webhooks — per provider IP
  webhookInbound:     { requests: 1000, window: 60 },     // 1000/min per IP

  // Public / unauthenticated
  publicApi:          { requests: 20,   window: 60 },     // 20/min per IP

  // AI / expensive operations
  aiGenerate:         { requests: 10,   window: 60 },     // 10/min per user
  aiGenerate_daily:   { requests: 100,  window: 86400 },  // 100/day per user
} as const;
```

## Sliding Window Implementation (Redis)

```typescript
// src/shared/utils/rate-limiter.ts
import { redis } from '@/shared/utils/redis';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
  retryAfter?: number; // seconds
}

export async function checkRateLimit(
  identifier: string,         // userId or IP
  action: string,             // 'login', 'api_write', etc.
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const key = `rl:${action}:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  try {
    // Atomic pipeline
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);           // remove expired
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` }); // add current
    pipeline.zcard(key);                                       // count in window
    pipeline.expire(key, windowSeconds + 1);                  // cleanup TTL

    const results = await pipeline.exec();
    const count = results[2] as number;
    const allowed = count <= limit;

    return {
      allowed,
      remaining: Math.max(0, limit - count),
      limit,
      resetAt: new Date(now + windowSeconds * 1000),
      retryAfter: allowed ? undefined : windowSeconds,
    };
  } catch (e) {
    // Fail open — Redis error should not block all users
    logger.error({ action: 'rate_limit_error', error: e.message, key });
    return { allowed: true, remaining: limit, limit, resetAt: new Date() };
  }
}
```

## Middleware Integration (Next.js)

```typescript
// src/middleware.ts — applies to all API routes
import { checkRateLimit } from '@/shared/utils/rate-limiter';

export async function middleware(request: NextRequest) {
  // Identify requester
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';

  // Route-specific limits
  const rateLimitConfig = getRateLimitConfig(request.nextUrl.pathname);
  if (!rateLimitConfig) return NextResponse.next();

  const identifier = rateLimitConfig.useUserId
    ? getSessionUserId(request) ?? ip
    : ip;

  const result = await checkRateLimit(
    identifier,
    rateLimitConfig.action,
    rateLimitConfig.limit,
    rateLimitConfig.window,
  );

  // Set standard headers on every response
  const response = result.allowed
    ? NextResponse.next()
    : NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429 }
      );

  response.headers.set('X-RateLimit-Limit', String(rateLimitConfig.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', result.resetAt.toISOString());
  if (!result.allowed && result.retryAfter) {
    response.headers.set('Retry-After', String(result.retryAfter));
  }

  return response;
}
```

## Per-Route Configuration

```typescript
function getRateLimitConfig(pathname: string): RateLimitConfig | null {
  if (pathname === '/api/auth/login') {
    return { action: 'login', limit: 5, window: 60, useUserId: false };
  }
  if (pathname === '/api/auth/register') {
    return { action: 'register', limit: 3, window: 60, useUserId: false };
  }
  if (pathname.startsWith('/api/ai/')) {
    return { action: 'ai_generate', limit: 10, window: 60, useUserId: true };
  }
  if (pathname.startsWith('/api/')) {
    return { action: 'api_write', limit: 30, window: 60, useUserId: true };
  }
  return null;
}
```

## Progressive Penalties

For repeated violations: don't just block, escalate.

```typescript
async function getAdaptiveLimit(
  identifier: string,
  action: string,
  baseLimit: number,
  windowSeconds: number,
): Promise<number> {
  const violationKey = `rl:violations:${action}:${identifier}`;
  const violations = await redis.get<number>(violationKey) ?? 0;

  // Reduce limit exponentially with violations
  const penaltyFactor = Math.pow(0.5, Math.min(violations, 5));
  return Math.max(1, Math.floor(baseLimit * penaltyFactor));
}

async function recordViolation(identifier: string, action: string): Promise<void> {
  const key = `rl:violations:${action}:${identifier}`;
  await redis.incr(key);
  await redis.expire(key, 3600); // violations reset after 1 hour
}
```

## Abuse Detection

```typescript
// Alert when patterns indicate coordinated abuse
async function detectAbuse(action: string, ip: string): Promise<void> {
  const recentViolations = await redis.incr(`abuse:${action}:${ip}`);
  await redis.expire(`abuse:${action}:${ip}`, 300); // 5-minute window

  if (recentViolations >= 20) {
    // IP is systematically abusing — alert + consider IP block
    await alertingService.send({
      severity: 'medium',
      title: `Rate limit abuse detected: ${action}`,
      body: `IP ${ip} has exceeded rate limits 20 times in 5 minutes`,
    });
  }
}

// Track credential stuffing patterns
// Multiple IPs → same account = credential stuffing
// One IP → many accounts = enumeration
```

## Upstash Rate Limit (Managed Alternative)

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'rl:ai',
});

const { success, limit, remaining, reset } = await ratelimit.limit(userId);
if (!success) return Response.json({ error: 'Rate limited' }, { status: 429 });
```

Upstash Ratelimit handles: algorithm, Redis operations, analytics. Use for simple cases. Build custom for complex penalty/abuse logic.

## Response Headers Standard
```
X-RateLimit-Limit:     100          ← requests allowed per window
X-RateLimit-Remaining: 87           ← requests remaining this window
X-RateLimit-Reset:     1704067260   ← UTC epoch when window resets
Retry-After:           30           ← seconds to wait (only on 429)
```

## Anti-Patterns (Instant Rejection)
- In-memory rate limiting behind load balancers (per-instance, not effective)
- No rate limit on auth endpoints (enables brute force)
- Failing closed when Redis is unavailable (blocks all users)
- No `Retry-After` header on 429 responses (clients don't know when to retry)
- Same limits for auth and read endpoints (auth needs much stricter limits)
- Limiting by user ID on auth endpoints before auth is verified (use IP)
- Fixed window allowing 2x burst at window boundaries
- No abuse escalation (persistent attackers unaffected by standard limits)
- Logging the identifier without considering it may be a real user IP (privacy)
