import crypto from 'node:crypto'

const SIGNUP_VERIFICATION_TTL_S = 15 * 60

function secret() {
  const signingSecret = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!signingSecret) throw new Error('JWT_SECRET or SUPABASE_SERVICE_ROLE_KEY must be set')
  return signingSecret
}

function base64urlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

export function signSignupVerificationToken(email) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase()
  const payload = {
    type: 'signup_verification',
    email: normalizedEmail,
    exp: Math.floor(Date.now() / 1000) + SIGNUP_VERIFICATION_TTL_S,
  }
  const body = base64urlJson(payload)
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifySignupVerificationToken(token, email) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase()
  const raw = String(token ?? '').trim()
  const dotIdx = raw.lastIndexOf('.')
  if (dotIdx === -1) return { ok: false, error: 'Email verification required' }

  const body = raw.slice(0, dotIdx)
  const sig = raw.slice(dotIdx + 1)
  const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url')
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return { ok: false, error: 'Email verification required' }
  }

  let payload
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return { ok: false, error: 'Email verification required' }
  }

  if (payload?.type !== 'signup_verification') return { ok: false, error: 'Email verification required' }
  if (payload?.email !== normalizedEmail) return { ok: false, error: 'Email verification required' }
  if (Number(payload?.exp ?? 0) <= Math.floor(Date.now() / 1000)) return { ok: false, error: 'Email verification expired' }

  return { ok: true }
}
