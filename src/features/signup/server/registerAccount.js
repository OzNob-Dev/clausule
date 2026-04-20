import crypto from 'node:crypto'
import { BrevoClient } from '@getbrevo/brevo'
import { insert, upsert, createUser } from '@api/_lib/supabase.js'
import { findProfileByEmail } from '@features/auth/server/accountRepository.js'

const PLAN_AMOUNT_CENTS = 500
const PLAN_CURRENCY = 'AUD'
const PLAN_INTERVAL = 'month'
const PLAN_LABEL = 'Clausule Individual'

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

function error(body, status) {
  return { body, status }
}

async function resolveUserId({ email, firstName, lastName }) {
  const { profile } = await findProfileByEmail(email)
  if (profile) return { userId: profile.id }

  const { data: created, error: createErr } = await createUser({
    email,
    user_metadata: { first_name: firstName, last_name: lastName || undefined },
  })

  if (!createErr) {
    const userId = authUserId(created)
    return userId ? { userId } : { log: ['[register] createUser returned no id:', created], ...error({ error: 'Failed to create user account' }, 500) }
  }

  const { profile: retryProfile } = await findProfileByEmail(email)
  if (retryProfile) return { userId: retryProfile.id }

  return { log: ['[register] createUser error:', createErr], ...error({ error: 'Failed to create user account' }, 500) }
}

export async function registerAccount(body) {
  const email = (body.email ?? '').trim().toLowerCase()
  const firstName = (body.firstName ?? '').trim()
  const lastName = (body.lastName ?? '').trim()
  const subscription = body.subscription ?? {}
  const amountCents = Number(subscription.amountCents)
  const currency = (subscription.currency ?? '').trim().toUpperCase()
  const interval = (subscription.interval ?? '').trim().toLowerCase()

  if (!email) return error({ error: 'email is required' }, 400)
  if (!firstName) return error({ error: 'firstName is required' }, 400)
  if (amountCents !== PLAN_AMOUNT_CENTS || currency !== PLAN_CURRENCY || interval !== PLAN_INTERVAL) {
    return error({ error: 'Invalid subscription plan' }, 400)
  }

  const resolved = await resolveUserId({ email, firstName, lastName })
  if (!resolved.userId) return resolved

  const { userId } = resolved
  const profilePayload = {
    id: userId,
    email,
    first_name: firstName,
    last_name: lastName || null,
    is_deleted: false,
  }

  const { data: upserted, error: profileError } = await upsert('profiles', profilePayload)
  if (profileError) return { log: ['[register] profile upsert error:', profileError], ...error({ error: 'Failed to save profile' }, 500) }

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
  if (subscriptionError) return { log: ['[register] subscription insert error:', subscriptionError], ...error({ error: 'Failed to create subscription' }, 500) }

  const { error: activationError } = await upsert('profiles', { ...profilePayload, is_active: true })
  if (activationError) return { log: ['[register] profile activation error:', activationError], ...error({ error: 'Failed to activate profile' }, 500) }

  try {
    await sendInvoiceEmail({ email, firstName, amountCents, periodStart: now, periodEnd: currentPeriodEnd })
  } catch (err) {
    return { log: ['[register] invoice email error:', err?.message ?? err], ...error({ error: 'Failed to send invoice' }, 502) }
  }

  return {
    body: { ok: true, role },
    status: 200,
    session: { userId, email, role },
  }
}
