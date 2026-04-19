/**
 * POST /api/auth/register
 *
 * Lightweight registration endpoint — no payment required.
 * Creates or updates a user profile and immediately issues JWT session cookies.
 *
 * Temporary: replaces the Stripe subscribe flow while payment is disabled.
 * Replace with /api/payments/subscribe when Stripe is re-enabled.
 *
 * Body:   { email: string, firstName: string, lastName?: string }
 * 200:    { ok: true, role: string }
 * 400:    { error: string }
 * 500:    { error: string }
 */

import { NextResponse }                     from 'next/server'
import crypto                               from 'node:crypto'
import { BrevoClient }                      from '@getbrevo/brevo'
import { appendSessionCookies,
         createPersistentSession }          from '@api/_lib/session.js'
import { insert, select, upsert,
         createUser }                       from '@api/_lib/supabase.js'

const PLAN_AMOUNT_CENTS = 500
const PLAN_CURRENCY = 'AUD'
const PLAN_INTERVAL = 'month'
const PLAN_LABEL = 'Clausule Individual'

function profileQuery(email) {
  return new URLSearchParams({ email: `ilike.${email}`, select: 'id,role', limit: '1' }).toString()
}

function authUserId(created) {
  return created?.id ?? created?.user?.id ?? null
}

function money(amountCents) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: PLAN_CURRENCY }).format(amountCents / 100)
}

async function sendInvoiceEmail({ email, firstName, amountCents, periodStart, periodEnd }) {
  if (!process.env.BREVO_API_KEY) throw new Error('Email service not configured')

  const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY })

  await client.transactionalEmails.sendTransacEmail({
    subject: `Your Clausule invoice ${invoiceNumber}`,
    sender: { name: 'Clausule', email: 'noreply@clausule.app' },
    to: [{ email }],
    htmlContent: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF7F3;border-radius:12px;color:#1A1510;">
        <p style="margin:0 0 8px;color:#786B5F;font-size:13px;">Invoice ${invoiceNumber}</p>
        <h2 style="margin:0 0 12px;font-size:22px;">Thanks${firstName ? `, ${firstName}` : ''}</h2>
        <p style="margin:0 0 24px;color:#5B4E42;">Your Clausule subscription is active.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:12px 0;border-bottom:1px solid #E6DDD3;">${PLAN_LABEL}</td><td style="padding:12px 0;border-bottom:1px solid #E6DDD3;text-align:right;">${money(amountCents)} / month</td></tr>
          <tr><td style="padding:12px 0;font-weight:700;">Paid today</td><td style="padding:12px 0;text-align:right;font-weight:700;">${money(amountCents)}</td></tr>
        </table>
        <p style="margin:0;color:#786B5F;font-size:13px;">Billing period: ${periodStart.toLocaleDateString('en-AU')} to ${periodEnd.toLocaleDateString('en-AU')}.</p>
      </div>
    `,
  })
}

export async function POST(request) {
  const body      = await request.json().catch(() => ({}))
  const email     = (body.email     ?? '').trim().toLowerCase()
  const firstName = (body.firstName ?? '').trim()
  const lastName  = (body.lastName  ?? '').trim()
  const subscription = body.subscription ?? {}
  const amountCents = Number(subscription.amountCents)
  const currency = (subscription.currency ?? '').trim().toUpperCase()
  const interval = (subscription.interval ?? '').trim().toLowerCase()

  if (!email)     return NextResponse.json({ error: 'email is required' },     { status: 400 })
  if (!firstName) return NextResponse.json({ error: 'firstName is required' }, { status: 400 })
  if (amountCents !== PLAN_AMOUNT_CENTS || currency !== PLAN_CURRENCY || interval !== PLAN_INTERVAL) {
    return NextResponse.json({ error: 'Invalid subscription plan' }, { status: 400 })
  }

  try {
    // ── Resolve userId ──────────────────────────────────────────────────────
    let userId

    const { data: profiles } = await select('profiles', profileQuery(email))

    if (profiles?.length) {
      userId = profiles[0].id
    } else {
      const { data: created, error: createErr } = await createUser({
        email,
        user_metadata: { first_name: firstName, last_name: lastName || undefined },
      })
      if (createErr) {
        const { data: retryProfiles } = await select('profiles', profileQuery(email))
        if (retryProfiles?.length) {
          userId = retryProfiles[0].id
        } else {
          console.error('[register] createUser error:', createErr)
          return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
        }
      } else {
        userId = authUserId(created)
        if (!userId) {
          console.error('[register] createUser returned no id:', created)
          return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
        }
      }
    }

    // ── Save / update profile ───────────────────────────────────────────────
    const { data: upserted, error: profileError } = await upsert('profiles', {
      id:         userId,
      email,
      first_name: firstName,
      last_name:  lastName || null,
    })

    if (profileError) {
      console.error('[register] profile upsert error:', profileError)
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
    }

    const role = (Array.isArray(upserted) ? upserted[0]?.role : upserted?.role) ?? 'employee'
    const now = new Date()
    const currentPeriodEnd = new Date(now)
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)

    const { error: subscriptionError } = await insert('subscriptions', {
      user_id: userId,
      status: 'active',
      plan: 'individual',
      amount_cents: amountCents,
      current_period_start: now.toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
    })

    if (subscriptionError) {
      console.error('[register] subscription insert error:', subscriptionError)
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
    }

    try {
      await sendInvoiceEmail({ email, firstName, amountCents, periodStart: now, periodEnd: currentPeriodEnd })
    } catch (err) {
      console.error('[register] invoice email error:', err?.message ?? err)
      return NextResponse.json({ error: 'Failed to send invoice' }, { status: 502 })
    }

    const response = NextResponse.json({ ok: true, role })
    const session = await createPersistentSession({ userId, email, role })
    return appendSessionCookies(response, session)
  } catch (err) {
    console.error('[register] error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
