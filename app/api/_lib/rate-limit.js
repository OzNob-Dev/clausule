/**
 * Simple in-memory rate limiter.
 *
 * NOTE: This only works correctly on a single Node.js instance.
 * For multi-instance deployments use a Redis-backed store (e.g. @upstash/ratelimit).
 *
 * Usage:
 *   const limiter = new RateLimiter({ limit: 3, windowMs: 10 * 60 * 1000 })
 *   const { allowed, retryAfterMs } = limiter.check(key)
 */
export class RateLimiter {
  /** @type {Map<string, { count: number, resetAt: number }>} */
  #store = new Map()

  /**
   * @param {{ limit: number, windowMs: number }} opts
   */
  constructor({ limit, windowMs }) {
    this.limit    = limit
    this.windowMs = windowMs
  }

  /**
   * @param {string} key - typically an IP address or email
   * @returns {{ allowed: boolean, retryAfterMs: number }}
   */
  check(key) {
    const now = Date.now()
    let entry = this.#store.get(key)

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + this.windowMs }
      this.#store.set(key, entry)
    }

    entry.count++

    if (entry.count > this.limit) {
      return { allowed: false, retryAfterMs: entry.resetAt - now }
    }

    return { allowed: true, retryAfterMs: 0 }
  }

  /** Prune expired entries (call periodically to avoid memory leak). */
  prune() {
    const now = Date.now()
    for (const [key, entry] of this.#store) {
      if (now > entry.resetAt) this.#store.delete(key)
    }
  }
}
