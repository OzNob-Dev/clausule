import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './route.js'
import { insert, select } from '@api/_lib/supabase.js'

const sendTransacEmail = vi.fn()

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(async () => ({ userId: 'user-1', email: 'ada@example.com', error: null })),
  authErrorResponse: vi.fn((message = 'Unauthenticated') => Response.json({ error: message === 'Auth lookup failed' ? 'Failed to verify session' : message }, { status: message === 'Auth lookup failed' ? 500 : 401 })),
}))

vi.mock('@auth/server/distributedRateLimit.js', () => ({
  consumeDistributedRateLimit: vi.fn(async () => ({ allowed: true, retryAfterMs: 0, error: null })),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  insert: vi.fn(),
  select: vi.fn(),
}))

vi.mock('@getbrevo/brevo', () => ({
  BrevoClient: vi.fn(() => ({
    transactionalEmails: { sendTransacEmail },
  })),
}))

function request(body = {}) {
  return new Request('http://localhost/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'Idea',
      feeling: 'Love it',
      subject: 'Keyboard shortcuts',
      message: 'Please add faster entry shortcuts.',
      improvement: 'Let me press j/k to move.',
      contactOk: true,
      ...body,
    }),
  })
}

describe('feedback route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BREVO_API_KEY = 'brevo-key'
    process.env.APP_FEEDBACK_EMAIL = 'owners@clausule.app'
    insert.mockResolvedValue({
      data: [{
        id: 'feedback-1',
        category: 'Idea',
        feeling: 'Love it',
        subject: 'Keyboard shortcuts',
        message: 'Please add faster entry shortcuts.',
        improvement: 'Let me press j/k to move.',
        contact_ok: true,
        created_at: '2026-04-20T10:00:00.000Z',
      }],
      error: null,
    })
    select.mockResolvedValue({ data: [], error: null })
  })

  it('emails product feedback to the app owners and confirms receipt to the user', async () => {
    const response = await POST(request())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      ok: true,
      feedback: expect.objectContaining({ id: 'feedback-1', replies: [] }),
    })
    expect(sendTransacEmail).toHaveBeenCalledWith(expect.objectContaining({
      subject: 'Clausule feedback: Keyboard shortcuts',
      to: [{ email: 'owners@clausule.app' }],
      htmlContent: expect.stringContaining('ada@example.com'),
    }))
    expect(sendTransacEmail).toHaveBeenCalledWith(expect.objectContaining({
      subject: 'Clausule received your feedback',
      to: [{ email: 'ada@example.com' }],
      htmlContent: expect.stringContaining('Your note made it through.'),
    }))
    expect(insert).toHaveBeenCalledWith('app_feedback', expect.objectContaining({
      user_id: 'user-1',
      user_email: 'ada@example.com',
      category: 'Idea',
      feeling: 'Love it',
      subject: 'Keyboard shortcuts',
      message: 'Please add faster entry shortcuts.',
      improvement: 'Let me press j/k to move.',
      contact_ok: true,
    }), { expectRows: 'single' })
  })

  it('requires a subject and message', async () => {
    const response = await POST(request({ subject: '', message: '' }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'subject is required' })
    expect(sendTransacEmail).not.toHaveBeenCalled()
    expect(insert).not.toHaveBeenCalled()
  })

  it('lists feedback threads for the signed-in user', async () => {
    select.mockResolvedValue({
      data: [{
        id: 'feedback-1',
        category: 'Bug',
        feeling: 'Blocked',
        subject: 'Export stuck',
        message: 'Spinner never ends.',
        improvement: null,
        contact_ok: true,
        created_at: '2026-04-20T10:00:00.000Z',
        app_feedback_replies: [{
          id: 'reply-1',
          author_name: 'Clausule team',
          body: 'We are on it.',
          from_team: true,
          created_at: '2026-04-20T11:00:00.000Z',
        }],
      }],
      error: null,
    })

    const response = await GET(new Request('http://localhost/api/feedback'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.feedback[0]).toEqual(expect.objectContaining({
      id: 'feedback-1',
      replies: [expect.objectContaining({ body: 'We are on it.' })],
    }))
    expect(select).toHaveBeenCalledWith('app_feedback', expect.stringContaining('user_id=eq.user-1'))
  })

  it('keeps feedback successful when email delivery fails after the audit row is saved', async () => {
    sendTransacEmail.mockRejectedValueOnce(new Error('brevo down'))

    const response = await POST(request())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      ok: true,
      feedback: expect.objectContaining({ id: 'feedback-1', replies: [] }),
    })
    expect(insert).toHaveBeenCalledTimes(1)
  })
})
