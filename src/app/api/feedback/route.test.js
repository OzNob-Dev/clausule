import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route.js'
import { insert } from '@api/_lib/supabase.js'

const sendTransacEmail = vi.fn()

vi.mock('@api/_lib/auth.js', () => ({
  requireAuth: vi.fn(() => ({ userId: 'user-1', email: 'ada@example.com', error: null })),
  unauthorized: vi.fn(() => Response.json({ error: 'Unauthenticated' }, { status: 401 })),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  insert: vi.fn(),
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
    insert.mockResolvedValue({ error: null })
  })

  it('emails product feedback to the app owners', async () => {
    const response = await POST(request())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ ok: true })
    expect(sendTransacEmail).toHaveBeenCalledWith(expect.objectContaining({
      subject: 'Clausule feedback: Keyboard shortcuts',
      to: [{ email: 'owners@clausule.app' }],
      htmlContent: expect.stringContaining('ada@example.com'),
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
      is_action: true,
    }))
  })

  it('requires a subject and message', async () => {
    const response = await POST(request({ subject: '', message: '' }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'subject is required' })
    expect(sendTransacEmail).not.toHaveBeenCalled()
    expect(insert).not.toHaveBeenCalled()
  })
})
