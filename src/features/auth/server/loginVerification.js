import { verifyTotp } from '@api/_lib/totp.js'
import { decryptTotpSecret, encryptTotpSecret } from '@api/_lib/totpEncryption.js'
import { update } from '@api/_lib/supabase.js'
import { validateEmail } from '@shared/utils/emailValidation'
import { accountActive, findProfileByEmail, getUserSsoProvider, hasActiveSubscription } from './accountRepository.js'
import { verifyEmailOtpCode } from './emailOtpVerification.js'
import { signSignupVerificationToken } from './signupVerification.js'

function invalidTotp() {
  return { body: { error: 'Invalid code' }, status: 401 }
}

export async function verifyEmailOtpLogin({ email, code }) {
  if (!email || code.length !== 6) return { body: { error: 'email and 6-digit code required' }, status: 400 }
  const verified = await verifyEmailOtpCode(email, code)
  if (!verified.ok) return { body: { error: verified.error }, status: verified.status }

  const { profile, error: profileError } = await findProfileByEmail(email, 'id,role,totp_secret,is_active,is_deleted')
  if (profileError) {
    return {
      log: ['[verify-code] profile lookup failed:', profileError],
      body: { error: 'Failed to verify code' },
      status: 500,
    }
  }
  if (!profile) {
    return {
      body: {
        ok: true,
        nextStep: 'signup',
        verificationToken: signSignupVerificationToken(email),
      },
      status: 200,
    }
  }

  const { hasPaid, error: paidError } = await hasActiveSubscription(profile.id)
  if (paidError) {
    return {
      log: ['[verify-code] subscription lookup failed:', paidError],
      body: { error: 'Failed to verify code' },
      status: 500,
    }
  }

  if (!accountActive(profile, hasPaid) || profile.is_deleted) {
    return {
      body: {
        ok: true,
        nextStep: 'signup',
        verificationToken: signSignupVerificationToken(email),
      },
      status: 200,
    }
  }

  const { provider, error: authError } = await getUserSsoProvider(profile.id)
  if (authError) {
    return {
      log: ['[verify-code] auth user lookup failed:', authError],
      body: { error: 'Failed to verify code' },
      status: 500,
    }
  }

  if (provider) {
    return {
      body: { ok: true, nextStep: 'sso' },
      status: 200,
    }
  }
  if (profile.totp_secret) {
    return {
      body: { ok: true, nextStep: 'mfa' },
      status: 200,
    }
  }

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
  if (dbError || !profile?.totp_secret || profile.is_deleted) return invalidTotp()

  const { hasPaid, error: paidError } = await hasActiveSubscription(profile.id)
  if (paidError) {
    return {
      log: ['[totp/verify] subscription lookup failed:', paidError],
      body: { error: 'Failed to verify code' },
      status: 500,
    }
  }
  if (!accountActive(profile, hasPaid)) return invalidTotp()

  const { id: userId, role, totp_secret: storedSecret } = profile

  let secret
  let wasPlaintext = false
  try {
    const decrypted = decryptTotpSecret(storedSecret)
    secret = decrypted.secret
    wasPlaintext = decrypted.wasPlaintext
  } catch {
    return {
      log: ['[totp/verify] TOTP secret decryption failed for user:', userId],
      body: { error: 'Failed to verify code' },
      status: 500,
    }
  }

  if (!verifyTotp(secret, code)) return invalidTotp()

  // Opportunistically re-encrypt legacy plaintext secrets on first successful login.
  if (wasPlaintext) {
    try {
      const encrypted = encryptTotpSecret(secret)
      await update('profiles', `id=eq.${userId}`, { totp_secret: encrypted }, { expectRows: 'single' })
    } catch (err) {
      console.error('[totp/verify] failed to re-encrypt legacy TOTP secret:', err?.message ?? err)
    }
  }

  return {
    body: { ok: true, role },
    status: 200,
    session: { userId, email, role, authMethod: 'totp' },
  }
}
