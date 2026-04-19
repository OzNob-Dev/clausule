/**
 * /api/auth/totp/setup
 *
 * GET  — generate a new TOTP secret for the authenticated user.
 *        Returns the base32 secret and an otpauth:// URI for QR rendering.
 *        Response 200: { secret: string, uri: string }
 *
 * POST — verify a TOTP code against a provisioned secret and activate it.
 *        Body: { code: string, secret: string }
 *        Response 200: { ok: true }
 *
 * TOTP is implemented without external deps using Node.js built-in crypto.
 * Algorithm: RFC 6238 — HMAC-SHA1, 6 digits, 30-second window.
 */

import { NextResponse }               from 'next/server'
import { requireAuth, unauthorized }  from '@api/_lib/auth.js'
import { update, select }             from '@api/_lib/supabase.js'
import { generateBase32Secret, verifyTotp } from '@api/_lib/totp.js'

// ── Route handlers ────────────────────────────────────────────────────────────

export async function GET(request) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  // Fetch the user's email for the otpauth URI label.
  let email = 'user'
  try {
    const { data: profiles } = await select('profiles', `id=eq.${userId}&select=email&limit=1`)
    if (profiles?.[0]?.email) email = profiles[0].email
  } catch { /* non-fatal */ }

  const secret = generateBase32Secret()
  const uri    = `otpauth://totp/Clausule:${encodeURIComponent(email)}?secret=${secret}&issuer=Clausule&algorithm=SHA1&digits=6&period=30`

  // Return the secret temporarily; it is only persisted after verification in POST.
  return NextResponse.json({ secret, uri })
}

export async function POST(request) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  const body   = await request.json().catch(() => ({}))
  const code   = (body.code   ?? '').replace(/\D/g, '').slice(0, 6)
  const secret = (body.secret ?? '').trim().toUpperCase()

  if (code.length !== 6 || !secret) {
    return NextResponse.json({ error: 'code (6 digits) and secret are required' }, { status: 400 })
  }

  if (!verifyTotp(secret, code)) {
    return NextResponse.json({ error: 'Invalid TOTP code' }, { status: 401 })
  }

  // Persist the TOTP secret to the user's profile.
  // The schema does not yet have a totp_secret column — add it via migration:
  //   ALTER TABLE profiles ADD COLUMN totp_secret text;
  const { error: updateError } = await update(
    'profiles',
    `id=eq.${userId}`,
    { totp_secret: secret }
  )

  if (updateError) {
    console.error('[totp/setup POST] update error:', updateError)
    return NextResponse.json({ error: 'Failed to save TOTP configuration' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
