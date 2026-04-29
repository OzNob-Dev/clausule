import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveClientIp, withTimeout } from './network'

describe('network helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    process.env.TRUSTED_PROXY_COUNT = '1'
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves the client ip from forwarded headers', () => {
    expect(resolveClientIp(new Request('http://localhost', { headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2' } }))).toBe('1.1.1.1')
  })

  it('resolves successful work', async () => {
    await expect(withTimeout(() => Promise.resolve('ok'), { timeoutMs: 100, timeoutLabel: 'Task' })).resolves.toBe('ok')
  })
})
