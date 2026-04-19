import crypto from 'node:crypto'
import { select, update } from '@api/_lib/supabase.js'
import { verifyTotp } from '@api/_lib/totp.js'
import { validateEmail } from '@shared/utils/emailValidation'

function profileQuery(email, selectFields = 'id,role') {
  return new URLSearchParams({ email: `ilike.${email}`, select: selectFields, limit: '1' }).toString()
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

function invalidOtp() {
  return { body: { error: 'Invalid or expired code — request a new one' }, status: 401 }
}

function invalidTotp() {
  return { body: { error: 'Invalid code' }, status: 401 }
}

async function profileForEmail(email, selectFields = 'id,role') {
  return select('profiles', profileQuery(email, selectFields))
}

export async function verifyEmailOtpLogin({ email, code }) {
  if (!email || code.length !== 6) return { body: { error: 'email and 6-digit code required' }, status: 400 }

  const query = new URLSearchParams({
    email: `eq.${email}`,
    used_at: 'is.null',
    expires_at: `gt.${new Date().toISOString()}`,
    order: 'created_at.desc',
    limit: '1',
  })

  const { data: rows, error: dbError } = await select('otp_codes', query.toString())
  if (dbError || !rows?.length) return invalidOtp()

  const row = rows[0]
  const [salt, storedHash] = row.code_hash.split(':')
  const submittedHash = crypto.createHmac('sha256', salt).update(code).digest('hex')
  if (!safeEqual(submittedHash, storedHash)) return invalidOtp()

  await update('otp_codes', `id=eq.${row.id}`, { used_at: new Date().toISOString() })

  const { data: profiles, error: profileError } = await profileForEmail(email)
  if (profileError || !profiles?.length) {
    return {
      log: ['[verify-code] profile lookup failed:', profileError],
      body: { error: 'User account not found' },
      status: 404,
    }
  }

  const { id: userId, role } = profiles[0]
  return {
    body: { ok: true, role },
    status: 200,
    session: { userId, email, role, authMethod: 'otp' },
  }
}

export async function verifyTotpLogin({ email, code }) {
  if (!validateEmail(email).valid || code.length !== 6) return { body: { error: 'email and 6-digit code required' }, status: 400 }

  const { data: profiles, error: dbError } = await profileForEmail(email, 'id,role,totp_secret')
  if (dbError || !profiles?.length || !profiles[0].totp_secret) return invalidTotp()

  const { id: userId, role, totp_secret: secret } = profiles[0]
  if (!verifyTotp(secret, code)) return invalidTotp()

  return {
    body: { ok: true, role },
    status: 200,
    session: { userId, email, role, authMethod: 'totp' },
  }
}
