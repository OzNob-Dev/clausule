/**
 * Resolve the client IP from a request.
 *
 * Reads the forwarded-for header and strips the trusted proxy tail, whose
 * depth is controlled by TRUSTED_PROXY_COUNT (default 1).  The header name
 * is kept in a single place so infra-specific overrides are a one-line change.
 *
 * @param {Request} request
 * @returns {string}
 */
export function resolveClientIp(request) {
  const header = request.headers.get('x-forwarded-for') ?? ''
  const ips = header.split(',').map((s) => s.trim()).filter(Boolean)
  const proxyCount = Math.max(0, parseInt(process.env.TRUSTED_PROXY_COUNT ?? '1', 10))
  // The real client IP is just before the trusted proxy chain at the tail.
  return ips[Math.max(0, ips.length - 1 - proxyCount)] ?? 'unknown'
}

function timeoutError(label, timeoutMs) {
  return Object.assign(new Error(`${label} timed out after ${timeoutMs}ms`), {
    code: 'REQUEST_TIMEOUT',
    status: 504,
  })
}

export async function withTimeout(work, { timeoutMs = 10_000, timeoutLabel = 'Request' } = {}) {
  let timer
  try {
    return await Promise.race([
      Promise.resolve().then(work),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(timeoutError(timeoutLabel, timeoutMs)), timeoutMs)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchWithTimeout(url, init = {}, { timeoutMs = 10_000, timeoutLabel = 'Request' } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(timeoutError(timeoutLabel, timeoutMs)), timeoutMs)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError' || error?.code === 'REQUEST_TIMEOUT') {
      throw timeoutError(timeoutLabel, timeoutMs)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}
