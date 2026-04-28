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
import { authErrorResponse, requireActiveAuth }  from '@api/_lib/auth.js'
import { createTotpSetup, saveTotpSetup } from '@auth/server/totpSetup.js'

// ── Route handlers ────────────────────────────────────────────────────────────

export async function GET(request) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)

  const result = await createTotpSetup({ userId })
  return NextResponse.json(result.body, { status: result.status })
}

export async function POST(request) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)

  const result = await saveTotpSetup({ userId, body: await request.json().catch(() => ({})) })
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}
