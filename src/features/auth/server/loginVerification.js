import { verifyTotp } from '@api/_lib/totp.js'
import { validateEmail } from '@shared/utils/emailValidation'
import { findProfileByEmail } from './accountRepository.js'
import { verifyEmailOtpCode } from './emailOtpVerification.js'

function invalidTotp() {
  return { body: { error: 'Invalid code' }, status: 401 }
}

export async function verifyEmailOtpLogin({ email, code }) {
  if (!email || code.length !== 6) return { body: { error: 'email and 6-digit code required' }, status: 400 }
  const verified = await verifyEmailOtpCode(email, code)
  if (!verified.ok) return { body: { error: verified.error }, status: verified.status }

  const { profile, error: profileError } = await findProfileByEmail(email, 'id,role,is_active,is_deleted')
  if (profileError || !profile) {
    return {
      log: ['[verify-code] profile lookup failed:', profileError],
      body: { error: 'User account not found' },
      status: 404,
    }
  }
  if (!profile.is_active || profile.is_deleted) return { body: { error: 'User account not found' }, status: 404 }

  const { id: userId, role } = profile
  return {
    body: { ok: true, role },
    status: 200,
    session: { userId, email, role, authMethod: 'otp' },
  }
}

export async function verifyTotpLogin({ email, code }) {
  if (!validateEmail(email).valid || code.length !== 6) return { body: { error: 'email and 6-digit code required' }, status: 400 }

  const { profile, error: dbError } = await findProfileByEmail(email, 'id,role,totp_secret,is_active,is_deleted')
  if (dbError || !profile?.totp_secret || !profile.is_active || profile.is_deleted) return invalidTotp()

  const { id: userId, role, totp_secret: secret } = profile
  if (!verifyTotp(secret, code)) return invalidTotp()

  return {
    body: { ok: true, role },
    status: 200,
    session: { userId, email, role, authMethod: 'totp' },
  }
}
