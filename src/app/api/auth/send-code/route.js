/**
 * POST /api/auth/send-code
 *
 * Generates a 6-digit OTP server-side, stores a bcrypt hash in the
 * otp_codes table, and sends the plaintext code via Brevo.
 *
 * The client NEVER sees or generates the code — it only receives it
 * in the email and submits it to /api/auth/verify-code.
 *
 * Body: { email: string }
 * Response 200: { ok: true }
 * Response 400: { error: string }
 * Response 429: { error: string, retryAfterMs: number }
 */

import { NextResponse }  from 'next/server'
import crypto            from 'node:crypto'
import { BrevoClient }   from '@getbrevo/brevo'
import { insert }        from '@api/_lib/supabase.js'
import { RateLimiter }   from '@api/_lib/rate-limit.js'
import { validateEmail } from '@shared/utils/emailValidation'

// 3 send attempts per 10 minutes per email address.
const limiter = new RateLimiter({ limit: 3, windowMs: 10 * 60 * 1000 })

/**
 * Generates a cryptographically random 6-digit numeric OTP.
 * @returns {string}
 */
function generateOtp() {
  // Use crypto.randomInt to avoid modulo bias.
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
}

/**
 * Hash the OTP using SHA-256 (fast, sufficient for short-lived codes).
 * A per-code salt defeats rainbow tables for this value space.
 * @param {string} code
 * @param {string} salt - hex string
 * @returns {string} hex digest
 */
function hashCode(code, salt) {
  return crypto.createHmac('sha256', salt).update(code).digest('hex')
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const email = (body.email ?? '').trim().toLowerCase()

  // Validate email format.
  const validation = validateEmail(email)
  if (!validation.valid) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Rate limit by email address.
  const { allowed, retryAfterMs } = limiter.check(email)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests — please wait before requesting another code', retryAfterMs },
      { status: 429 }
    )
  }

  if (!process.env.BREVO_API_KEY) {
    console.error('[send-code] BREVO_API_KEY not set')
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  // Generate OTP and derive a hash for storage.
  const code  = generateOtp()
  const salt  = crypto.randomBytes(16).toString('hex')
  const hash  = hashCode(code, salt)

  // Store hash in DB.  The stored value is "{salt}:{hash}" so verification
  // can reconstruct the HMAC without an extra column.
  const { error: dbError } = await insert('otp_codes', {
    email,
    code_hash: `${salt}:${hash}`,
    // expires_at defaults to now() + 10 minutes in the DB schema.
  })

  if (dbError) {
    console.error('[send-code] DB insert error:', dbError)
    return NextResponse.json({ error: 'Failed to create verification code' }, { status: 500 })
  }

  // Send the plaintext code via Brevo.
  const digitBoxes = code
    .split('')
    .map(
      (d) =>
        `<span style="display:inline-flex;align-items:center;justify-content:center;` +
        `width:44px;height:52px;border-radius:8px;background:#fff;` +
        `border:1.5px solid rgba(208,90,52,0.35);font-size:22px;font-weight:800;` +
        `color:#C0532A;font-family:monospace;">${d}</span>`
    )
    .join('')

  try {
    const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY })
    await client.transactionalEmails.sendTransacEmail({
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
          <div style="display:flex;gap:8px;margin-bottom:24px;">${digitBoxes}</div>
          <p style="color:#8A7E76;font-size:13px;margin:0;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[send-code] Brevo error:', err?.message ?? err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
