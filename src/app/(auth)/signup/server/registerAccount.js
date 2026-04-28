import { BrevoClient } from '@getbrevo/brevo'
import { createUser, rpc } from '@api/_lib/supabase.js'
import { withTimeout } from '@api/_lib/network.js'
import { findProfileByEmail, getUserSsoProvider } from '@auth/server/accountRepository.js'
import { INDIVIDUAL_MONTHLY_PLAN, formatPlanAmount } from '@signup/shared/plan'
import {
  beginBackendOperation,
  completeBackendOperation,
  registerOperationKey,
  registerOperationType,
} from '@auth/server/backendOperation.js'

const PLAN_AMOUNT_CENTS = INDIVIDUAL_MONTHLY_PLAN.amountCents
const PLAN_CURRENCY = INDIVIDUAL_MONTHLY_PLAN.currency
const PLAN_INTERVAL = INDIVIDUAL_MONTHLY_PLAN.interval
const PLAN_LABEL = INDIVIDUAL_MONTHLY_PLAN.label

/** @param {string} str @returns {string} */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function authUserId(created) {
  return created?.id ?? created?.user?.id ?? null
}

function money(amountCents) {
  return formatPlanAmount(amountCents, PLAN_CURRENCY)
}

async function sendPlanActivationEmail({ email, firstName, amountCents, periodStart, periodEnd }) {
  if (!process.env.BREVO_API_KEY) throw new Error('Email service not configured')

  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY })

  await withTimeout(
    () => client.transactionalEmails.sendTransacEmail({
      subject: 'Your Clausule plan is active',
      sender: { name: 'Clausule', email: 'noreply@clausule.app' },
      to: [{ email }],
      htmlContent: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF7F3;border-radius:12px;color:#1A1510;">
          <h2 style="margin:0 0 12px;font-size:22px;">Thanks${firstName ? `, ${escapeHtml(firstName)}` : ''}</h2>
          <p style="margin:0 0 24px;color:#5B4E42;">Your Clausule account and fixed rollout plan are now active.</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:12px 0;border-bottom:1px solid #E6DDD3;">Plan</td><td style="padding:12px 0;border-bottom:1px solid #E6DDD3;text-align:right;">${PLAN_LABEL}</td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px solid #E6DDD3;">Price</td><td style="padding:12px 0;border-bottom:1px solid #E6DDD3;text-align:right;">${money(amountCents)} / month</td></tr>
            <tr><td style="padding:12px 0;font-weight:700;">Status</td><td style="padding:12px 0;text-align:right;font-weight:700;">Active</td></tr>
          </table>
          <p style="margin:0;color:#786B5F;font-size:13px;">Current access period: ${periodStart.toLocaleDateString('en-AU')} to ${periodEnd.toLocaleDateString('en-AU')}.</p>
        </div>
      `,
    }),
    { timeoutMs: 10_000, timeoutLabel: 'Brevo plan activation email' }
  )
}

function error(body, status) {
  return { body, status }
}

function isActiveSubscriptionConflict(dbError) {
  const message = `${dbError?.message ?? ''} ${dbError?.details ?? ''}`.toLowerCase()
  return dbError?.code === '23505' && (
    message.includes('idx_subscriptions_user_id_unique')
    || message.includes('idx_subscriptions_active_user_unique')
  )
}

function isDeletedAccountError(dbError) {
  return `${dbError?.message ?? ''} ${dbError?.details ?? ''}`.toLowerCase().includes('deleted profiles cannot be reactivated')
}

function deletedAccountResult() {
  return error({ error: 'Account unavailable - contact support' }, 403)
}

async function reuseExistingProfile(profile) {
  if (profile.is_deleted) return deletedAccountResult()
  const { provider, error: authErr } = await getUserSsoProvider(profile.id)
  if (authErr) return { log: ['[register] auth user lookup failed:', authErr], ...error({ error: 'Failed to create user account' }, 500) }
  if (provider) return error({ error: 'Account requires SSO sign-in', nextStep: 'sso' }, 403)
  if (profile.totp_secret) return error({ error: 'Account requires authenticator sign-in', nextStep: 'mfa' }, 403)
  return { userId: profile.id }
}

async function resolveUserId({ email, firstName, lastName }) {
  const { profile, error: profileError } = await findProfileByEmail(email, 'id,totp_secret,is_deleted')
  if (profileError) {
    return { log: ['[register] profile lookup failed:', profileError], ...error({ error: 'Failed to create user account' }, 500) }
  }
  if (profile) return reuseExistingProfile(profile)

  const { data: created, error: createErr } = await createUser({
    email,
    user_metadata: { first_name: firstName, last_name: lastName || undefined },
  })

  if (!createErr) {
    const userId = authUserId(created)
    return userId ? { userId } : { log: ['[register] createUser returned no id:', created], ...error({ error: 'Failed to create user account' }, 500) }
  }

  const { profile: retryProfile, error: retryProfileError } = await findProfileByEmail(email, 'id,totp_secret,is_deleted')
  if (retryProfileError) {
    return { log: ['[register] retry profile lookup failed:', retryProfileError], ...error({ error: 'Failed to create user account' }, 500) }
  }
  if (retryProfile) return reuseExistingProfile(retryProfile)

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
    if (isDeletedAccountError(finalizeError)) return deletedAccountResult()
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
    await sendPlanActivationEmail({ email, firstName, amountCents, periodStart: now, periodEnd: currentPeriodEnd })
  } catch (err) {
    console.error('[register] plan activation email error:', err?.message ?? err)
  }

  return result
}
