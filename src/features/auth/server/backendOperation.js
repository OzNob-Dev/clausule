import { rpc } from '@api/_lib/supabase.js'

const REGISTER_OPERATION_TYPE = 'register'
const SUBSCRIBE_OPERATION_TYPE = 'subscribe'

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

function completedResult(row) {
  if (
    row?.status !== 'completed'
    || !row.user_id
    || !row.session_email
    || !row.session_role
    || !row.response_body
  ) {
    return null
  }

  return {
    body: row.response_body,
    status: row.status_code ?? 200,
    session: {
      userId: row.user_id,
      email: row.session_email,
      role: row.session_role,
    },
  }
}

function firstRow(data) {
  return Array.isArray(data) ? data[0] ?? null : data ?? null
}

export function registerOperationKey({ email }) {
  return `register:${normalizeEmail(email)}:individual:aud:500:month`
}

export function subscribeOperationKey({ authedId, email, paymentMethodId }) {
  const owner = authedId || normalizeEmail(email)
  return `subscribe:${owner}:${String(paymentMethodId ?? '').trim()}:individual:usd:500:month`
}

export async function beginBackendOperation({ operationKey, operationType, email = null, userId = null }) {
  const { data, error } = await rpc('begin_backend_operation', {
    p_operation_key: operationKey,
    p_operation_type: operationType,
    p_email: email ? normalizeEmail(email) : null,
    p_user_id: userId,
  })
  if (error) return { error }

  const row = firstRow(data)
  return { row, replay: completedResult(row) }
}

export async function completeBackendOperation({
  operationKey,
  operationType,
  statusCode,
  session,
  body,
  stripeCustomerId = null,
  stripeSubscriptionId = null,
}) {
  return rpc('complete_backend_operation', {
    p_operation_key: operationKey,
    p_operation_type: operationType,
    p_status_code: statusCode,
    p_user_id: session.userId,
    p_session_email: normalizeEmail(session.email),
    p_session_role: session.role,
    p_response_body: body,
    p_stripe_customer_id: stripeCustomerId,
    p_stripe_subscription_id: stripeSubscriptionId,
  }, { expectRows: 'single' })
}

export function registerOperationType() {
  return REGISTER_OPERATION_TYPE
}

export function subscribeOperationType() {
  return SUBSCRIBE_OPERATION_TYPE
}
