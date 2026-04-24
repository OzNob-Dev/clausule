import crypto from 'node:crypto'
import { BrevoClient } from '@getbrevo/brevo'
import { createUser, rpc } from '@api/_lib/supabase.js'
import { withTimeout } from '@api/_lib/network.js'
import { findProfileByEmail } from '@features/auth/server/accountRepository.js'
import {
  beginBackendOperation,
  completeBackendOperation,
  registerOperationKey,
  registerOperationType,
} from '@features/auth/server/backendOperation.js'
import { verifySignupVerificationToken } from '@features/auth/server/signupVerification.js'

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

  await withTimeout(
    () => client.transactionalEmails.sendTransacEmail({
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
    }),
    { timeoutMs: 10_000, timeoutLabel: 'Brevo invoice email' }
  )
}

function error(body, status) {
  return { body, status }
}

function isActiveSubscriptionConflict(dbError) {
  const message = `${dbError?.message ?? ''} ${dbError?.details ?? ''}`.toLowerCase()
  return dbError?.code === '23505' && message.includes('idx_subscriptions_active_user_unique')
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
  const verified = verifySignupVerificationToken(body.verificationToken, email)
  if (!verified.ok) return error({ error: verified.error }, 401)
  if (amountCents !== PLAN_AMOUNT_CENTS || currency !== PLAN_CURRENCY || interval !== PLAN_INTERVAL) {
    return error({ error: 'Invalid subscription plan' }, 400)
  }

  const operationKey = registerOperationKey({ email })
  const operation = await beginBackendOperation({
    operationKey,
    operationType: registerOperationType(),
    email,
  })
  if (operation.error) {
    return { log: ['[register] begin operation error:', operation.error], ...error({ error: 'Failed to create subscription' }, 500) }
  }
  if (operation.replay) return operation.replay

  const resolved = await resolveUserId({ email, firstName, lastName })
  if (!resolved.userId) return resolved

  const { userId } = resolved
  const now = new Date()
  const currentPeriodEnd = new Date(now)
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)

  const { data: finalized, error: finalizeError } = await rpc('finalize_individual_subscription', {
    p_user_id: userId,
    p_email: email,
    p_first_name: firstName,
    p_last_name: lastName || null,
    p_status: 'active',
    p_amount_cents: amountCents,
    p_current_period_start: now.toISOString(),
    p_current_period_end: currentPeriodEnd.toISOString(),
    p_retry_key: operationKey,
    p_activate: true,
  })
  if (finalizeError) {
    if (isActiveSubscriptionConflict(finalizeError)) {
      return error({ error: 'Active subscription already exists' }, 409)
    }
    return { log: ['[register] finalize subscription error:', finalizeError], ...error({ error: 'Failed to create subscription' }, 500) }
  }

  const row = Array.isArray(finalized) ? finalized[0] : finalized
  const role = row?.role ?? 'employee'
  const result = {
    body: { ok: true, role },
    status: 200,
    session: { userId, email, role },
  }

  const { error: completeError } = await completeBackendOperation({
    operationKey,
    operationType: registerOperationType(),
    statusCode: result.status,
    session: result.session,
    body: result.body,
  })
  if (completeError) {
    return { log: ['[register] complete operation error:', completeError], ...error({ error: 'Failed to create subscription' }, 500) }
  }

  try {
    await sendInvoiceEmail({ email, firstName, amountCents, periodStart: now, periodEnd: currentPeriodEnd })
  } catch (err) {
    console.error('[register] invoice email error:', err?.message ?? err)
  }

  return result
}
