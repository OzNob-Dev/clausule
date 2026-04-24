import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(async () => ({ userId: 'user-1', error: null })),
  authErrorResponse: vi.fn((message = 'Unauthenticated') => Response.json({ error: message === 'Auth lookup failed' ? 'Failed to verify session' : message }, { status: message === 'Auth lookup failed' ? 500 : 401 })),
}))

vi.mock('@features/auth/server/distributedRateLimit.js', () => ({
  consumeDistributedRateLimit: vi.fn(async () => ({ allowed: true, retryAfterMs: 0, error: null })),
}))

function request(body = {}) {
  return new Request('http://localhost/api/ai/draft-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employeeName: 'Ada Lovelace',
      entries: [{ cat: 'dev', title: 'Shipped analytics', body: 'Built a dashboard for team reporting.' }],
      ...body,
    }),
  })
}

describe('draft summary route', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.ANTHROPIC_API_KEY = 'anthropic-key'
  })

  it('validates required summary inputs', async () => {
    const response = await POST(request({ employeeName: '', entries: [] }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'employeeName and entries required' })
  })

  it('sends bounded note content to the AI provider', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      content: [{ text: 'Ada consistently ships useful reporting improvements.' }],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    const response = await POST(request({
      entries: [{ cat: 'dev', title: 'x'.repeat(1200), body: 'y'.repeat(1200) }],
    }))
    const data = await response.json()
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body)

    expect(response.status).toBe(200)
    expect(data).toEqual({ text: 'Ada consistently ships useful reporting improvements.' })
    expect(payload.messages[0].content).toContain('x'.repeat(1000))
    expect(payload.messages[0].content).not.toContain('x'.repeat(1001))
    expect(payload.messages[0].content).not.toContain('y'.repeat(1001))
  })
})
