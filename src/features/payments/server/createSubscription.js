import { createUser, rpc } from '@api/_lib/supabase.js'
import { fetchWithTimeout } from '@api/_lib/network.js'
import { findProfileByEmail, findProfileById, getUserSsoProvider, hasActiveSubscription } from '@features/auth/server/accountRepository.js'
import {
  beginBackendOperation,
  completeBackendOperation,
  subscribeOperationKey,
  subscribeOperationType,
} from '@features/auth/server/backendOperation.js'
import { verifySignupVerificationToken } from '@features/auth/server/signupVerification.js'

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_API = 'https://api.stripe.com/v1'
const PLAN_AMOUNT_CENTS = 500
const PLAN_CURRENCY = 'aud'

function authUserId(created) {
  return created?.id ?? created?.user?.id ?? null
}

function isActiveSubscriptionConflict(dbError) {
  const message = `${dbError?.message ?? ''} ${dbError?.details ?? ''}`.toLowerCase()
  return dbError?.code === '23505' && (
    message.includes('idx_subscriptions_user_id_unique')
    || message.includes('idx_subscriptions_active_user_unique')
  )
}

async function stripe(path, body = null, method = 'POST', idempotencyKey = null) {
  const res = await fetchWithTimeout(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: body ? body.toString() : undefined,
  }, { timeoutMs: 10_000, timeoutLabel: `Stripe ${method} ${path}` })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? `Stripe HTTP ${res.status}`)
  return data
}

async function resolveUserIdentity({ authedId, authEmail, email, firstName, lastName }) {
  if (authedId) {
    const { profile, error } = await findProfileById(authedId, 'id,email,first_name,last_name')
    if (error) throw Object.assign(new Error('Failed to resolve user'), { status: 500, log: ['[subscribe] profile lookup error:', error] })
    if (!profile) throw Object.assign(new Error('Failed to resolve user'), { status: 500, log: ['[subscribe] profile not found for authenticated user:', authedId] })

    return {
      userId: profile.id,
      email: (authEmail ?? profile.email ?? email).trim().toLowerCase(),
      firstName: String(profile.first_name ?? '').trim() || firstName,
      lastName: String(profile.last_name ?? '').trim() || lastName,
    }
  }

  const { profile } = await findProfileByEmail(email, 'id,totp_secret')
  if (profile) {
    // Unauthenticated subscribe path — refuse to mint a session for accounts that
    // require SSO or TOTP, since email-OTP proof alone doesn't satisfy those policies.
    const { provider, error: authErr } = await getUserSsoProvider(profile.id)
    if (authErr) throw Object.assign(new Error('Failed to resolve user'), { status: 500 })
    if (provider) throw Object.assign(new Error('Account requires SSO sign-in'), { status: 403, nextStep: 'sso' })
    if (profile.totp_secret) throw Object.assign(new Error('Account requires authenticator sign-in'), { status: 403, nextStep: 'mfa' })
    return { userId: profile.id, email, firstName, lastName }
  }

  const { data: created, error: createErr } = await createUser({
    email,
    user_metadata: { first_name: firstName, last_name: lastName || undefined },
  })
  if (createErr) throw Object.assign(new Error('Failed to create user account'), { status: 500, log: ['[subscribe] createUser error:', createErr] })
  const userId = authUserId(created)
  if (!userId) throw Object.assign(new Error('Failed to create user account'), { status: 500, log: ['[subscribe] createUser returned no id:', created] })
  return { userId, email, firstName, lastName }
}

export function paymentSystemConfigured() {
  return Boolean(STRIPE_KEY)
}

export async function createSubscription({ body, authedId, authEmail = null }) {
  const paymentMethodId = (body.paymentMethodId ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase()
  const firstName = (body.firstName ?? '').trim()
  const lastName = (body.lastName ?? '').trim()

  if (!paymentMethodId || !email) return { body: { error: 'paymentMethodId and email are required' }, status: 400 }
  if (!authedId && !firstName) return { body: { error: 'firstName is required' }, status: 400 }
  if (!authedId) {
    const verified = verifySignupVerificationToken(body.verificationToken, email)
    if (!verified.ok) return { body: { error: verified.error }, status: 401 }
  }

  const operationKey = subscribeOperationKey({ authedId, email, paymentMethodId })
  const operation = await beginBackendOperation({
    operationKey,
    operationType: subscribeOperationType(),
    email: authEmail || email,
    userId: authedId,
  })
  if (operation.error) throw Object.assign(new Error('Failed to save subscription'), { status: 500, log: ['[subscribe] begin operation error:', operation.error] })
  if (operation.replay) return operation.replay

  const identity = await resolveUserIdentity({ authedId, authEmail, email, firstName, lastName })
  const userId = identity.userId
  const canonicalEmail = identity.email
  const canonicalFirstName = identity.firstName
  const canonicalLastName = identity.lastName
  const fullName = [canonicalFirstName, canonicalLastName].filter(Boolean).join(' ')

  const { hasPaid } = await hasActiveSubscription(userId)
  if (hasPaid) return { body: { error: 'Active subscription already exists' }, status: 409 }

  const customer = await stripe('/customers', new URLSearchParams({ email: canonicalEmail, name: fullName }), 'POST', `${operationKey}:customer`)

  await stripe(`/payment_methods/${paymentMethodId}/attach`, new URLSearchParams({ customer: customer.id }), 'POST', `${operationKey}:attach`)

  await stripe(
    `/customers/${customer.id}`,
    new URLSearchParams({ 'invoice_settings[default_payment_method]': paymentMethodId }),
    'POST',
    `${operationKey}:customer-default`
  )

  const subscription = await stripe('/subscriptions', new URLSearchParams({
    customer: customer.id,
    'items[0][price_data][currency]': PLAN_CURRENCY,
    'items[0][price_data][product_data][name]': 'Clausule Individual',
    'items[0][price_data][unit_amount]': String(PLAN_AMOUNT_CENTS),
    'items[0][price_data][recurring][interval]': 'month',
    payment_behavior: 'default_incomplete',
    'expand[]': 'latest_invoice.payment_intent',
  }), 'POST', `${operationKey}:subscription`)

  const { data: finalized, error: finalizeError } = await rpc('finalize_individual_subscription', {
    p_user_id: userId,
    p_email: canonicalEmail,
    p_first_name: canonicalFirstName,
    p_last_name: canonicalLastName || null,
    p_status: subscription.status,
    p_amount_cents: PLAN_AMOUNT_CENTS,
    p_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    p_stripe_customer_id: customer.id,
    p_stripe_subscription_id: subscription.id,
    p_retry_key: operationKey,
    p_activate: subscription.status === 'active' || subscription.status === 'trialing',
  })
  if (finalizeError) {
    try {
      await stripe(`/subscriptions/${subscription.id}`, null, 'DELETE')
    } catch (cleanupError) {
      console.error('[subscribe] rollback subscription error:', cleanupError.message)
    }
    if (isActiveSubscriptionConflict(finalizeError)) {
      throw Object.assign(new Error('Active subscription already exists'), { status: 409 })
    }
    throw Object.assign(new Error('Failed to save subscription'), { status: 500, log: ['[subscribe] finalize subscription error:', finalizeError] })
  }

  const row = Array.isArray(finalized) ? finalized[0] : finalized
  const role = row?.role ?? 'employee'
  const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret ?? null
  const result = {
    body: { ok: true, subscriptionId: subscription.id, clientSecret, role },
    status: 200,
    session: { userId, email: canonicalEmail, role },
  }

  const { error: completeError } = await completeBackendOperation({
    operationKey,
    operationType: subscribeOperationType(),
    statusCode: result.status,
    session: result.session,
    body: result.body,
    stripeCustomerId: customer.id,
    stripeSubscriptionId: subscription.id,
  })
  if (completeError) {
    throw Object.assign(new Error('Failed to save subscription'), { status: 500, log: ['[subscribe] complete operation error:', completeError] })
  }

  return result
}
