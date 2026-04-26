import crypto from 'node:crypto'
import { BrevoClient } from '@getbrevo/brevo'
import { del, insert, update } from '@api/_lib/supabase.js'
import { withTimeout } from '@api/_lib/network.js'
import { validateEmail } from '@shared/utils/emailValidation'
import { findProfileByEmail } from '@features/auth/server/accountRepository.js'

function generateOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
}

function hashCode(code, salt) {
  return crypto.createHmac('sha256', salt).update(code).digest('hex')
}

function digitBoxes(code) {
  return code
    .split('')
    .map(
      (d) =>
        `<span style="display:inline-flex;align-items:center;justify-content:center;` +
        `width:44px;height:52px;border-radius:8px;background:#fff;` +
        `border:1.5px solid rgba(208,90,52,0.35);font-size:22px;font-weight:800;` +
        `color:#C0532A;font-family:monospace;">${d}</span>`
    )
    .join('')
}

export async function sendOtpCode(body) {
  const email = (body.email ?? '').trim().toLowerCase()

  if (!validateEmail(email).valid) return { body: { error: 'Invalid email address' }, status: 400 }

  const { profile } = await findProfileByEmail(email, 'totp_secret')
  if (profile?.totp_secret) {
    return { body: { mfaRequired: true }, status: 200 }
  }

  if (!process.env.BREVO_API_KEY) {
    return { log: ['[send-code] BREVO_API_KEY not set'], body: { error: 'Email service not configured' }, status: 500 }
  }

  const code = generateOtp()
  const salt = crypto.randomBytes(16).toString('hex')
  const now = new Date().toISOString()
  const { data: rows, error: dbError } = await insert('otp_codes', {
    email,
    code_hash: `${salt}:${hashCode(code, salt)}`,
    delivered_at: null,
  }, { expectRows: 'single' })

  if (dbError) return { log: ['[send-code] DB insert error:', dbError], body: { error: 'Failed to create verification code' }, status: 500 }

  const otpId = rows?.[0]?.id
  try {
    const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY })
    await withTimeout(
      () => client.transactionalEmails.sendTransacEmail({
        subject: 'Your Clausule sign-in code',
        sender: { name: 'Clausule', email: 'noreply@clausule.app' },
        to: [{ email }],
        htmlContent: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;
                      background:#FAF7F3;border-radius:12px;">
            <h2 style="margin:0 0 8px;font-size:20px;color:#2A221A;">Your sign-in code</h2>
            <p style="color:#5C5048;margin:0 0 24px;">
              Use the code below to sign in to Clausule. It expires in 10 minutes.
            </p>
            <div style="display:flex;gap:8px;margin-bottom:24px;">${digitBoxes(code)}</div>
            <p style="color:#8A7E76;font-size:13px;margin:0;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      }),
      { timeoutMs: 10_000, timeoutLabel: 'Brevo OTP email' }
    )
    if (otpId) {
      const { error: deliveredError } = await update('otp_codes', `id=eq.${otpId}`, { delivered_at: now }, { expectRows: 'single' })
      if (deliveredError) {
        await del('otp_codes', `id=eq.${otpId}`)
        return { log: ['[send-code] delivered_at update error:', deliveredError], body: { error: 'Failed to send email' }, status: 500 }
      }
    }
  } catch (err) {
    if (otpId) await del('otp_codes', `id=eq.${otpId}`)
    return { log: ['[send-code] Brevo error:', err?.message ?? err], body: { error: 'Failed to send email' }, status: 502 }
  }

  return { body: { ok: true }, status: 200 }
}
