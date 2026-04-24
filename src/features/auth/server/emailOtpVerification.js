import { rpc } from '@api/_lib/supabase.js'

export async function verifyEmailOtpCode(email, code) {
  const { data, error } = await rpc('consume_email_otp_code', {
    p_email: email,
    p_code: code,
    p_now: new Date().toISOString(),
  })
  if (error) return { ok: false, status: 500, error: 'Failed to verify code' }
  if (!Array.isArray(data) || data.length !== 1) {
    return { ok: false, status: 401, error: 'Invalid or expired code - request a new one' }
  }

  return { ok: true }
}
