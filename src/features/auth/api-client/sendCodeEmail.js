/**
 * Triggers server-side OTP generation and email delivery.
 * The code is generated server-side; the client never sees it.
 */
import { jsonRequest } from '@shared/utils/api'

export async function sendCodeEmail(email) {
  const res = await fetch('/api/auth/send-code', jsonRequest({ email }, { method: 'POST' }))

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
}
