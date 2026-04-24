import { beforeEach, describe, expect, it, vi } from 'vitest'
import { del, insert, update } from '@api/_lib/supabase.js'
import { sendOtpCode } from './sendOtpCode.js'

const sendTransacEmail = vi.fn()

vi.mock('@api/_lib/supabase.js', () => ({
  del: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@getbrevo/brevo', () => ({
  BrevoClient: vi.fn(() => ({
    transactionalEmails: { sendTransacEmail },
  })),
}))

describe('sendOtpCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BREVO_API_KEY = 'brevo-key'
    insert.mockResolvedValue({ data: [{ id: 'otp-1' }], error: null })
    update.mockResolvedValue({ data: [{ id: 'otp-1', delivered_at: '2026-04-25T00:00:00.000Z' }], error: null })
    del.mockResolvedValue({ data: null, error: null })
    sendTransacEmail.mockResolvedValue({ messageId: 'msg-1' })
  })

  it('marks the OTP delivered only after the email send succeeds', async () => {
    const result = await sendOtpCode({ email: 'Ada@Example.com' })

    expect(result).toEqual({ body: { ok: true }, status: 200 })
    expect(insert).toHaveBeenCalledWith('otp_codes', expect.objectContaining({
      email: 'ada@example.com',
      delivered_at: null,
    }), { expectRows: 'single' })
    expect(update).toHaveBeenCalledWith('otp_codes', 'id=eq.otp-1', expect.objectContaining({
      delivered_at: expect.any(String),
    }), { expectRows: 'single' })
    expect(del).not.toHaveBeenCalled()
  })

  it('deletes the pending OTP when email delivery fails', async () => {
    sendTransacEmail.mockRejectedValueOnce(new Error('brevo down'))

    const result = await sendOtpCode({ email: 'ada@example.com' })

    expect(result.status).toBe(502)
    expect(result.body).toEqual({ error: 'Failed to send email' })
    expect(del).toHaveBeenCalledWith('otp_codes', 'id=eq.otp-1')
  })
})
