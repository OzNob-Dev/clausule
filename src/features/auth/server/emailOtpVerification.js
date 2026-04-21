import crypto from 'node:crypto'
import { select, update } from '@api/_lib/supabase.js'

function safeEqual(a, b) {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function verifyEmailOtpCode(email, code) {
  const query = new URLSearchParams({
    email: `eq.${email}`,
    used_at: 'is.null',
    expires_at: `gt.${new Date().toISOString()}`,
    order: 'created_at.desc',
    limit: '1',
  })

  const { data: rows, error: dbError } = await select('otp_codes', query.toString())
  if (dbError || !rows?.length) return { ok: false, status: 401, error: 'Invalid or expired code - request a new one' }

  const row = rows[0]
  const [salt, storedHash] = row.code_hash.split(':')
  const submittedHash = crypto.createHmac('sha256', salt).update(code).digest('hex')
  if (!safeEqual(submittedHash, storedHash)) return { ok: false, status: 401, error: 'Invalid or expired code - request a new one' }

  const { error: markError } = await update('otp_codes', `id=eq.${row.id}`, { used_at: new Date().toISOString() })
  if (markError) return { ok: false, status: 500, error: 'Failed to verify code' }

  return { ok: true }
}
