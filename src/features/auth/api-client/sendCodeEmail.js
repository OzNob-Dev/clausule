/**
 * Triggers server-side OTP generation and email delivery.
 * The code is generated server-side; the client never sees it.
 */
import { apiJson, jsonRequest } from '@shared/utils/api'

export async function sendCodeEmail(email) {
  await apiJson('/api/auth/send-code', jsonRequest({ email }, { method: 'POST' }), { retryOnUnauthorized: false })
}
