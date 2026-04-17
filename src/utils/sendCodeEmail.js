/**
 * Triggers server-side OTP generation and email delivery.
 * The code is generated server-side; the client never sees it.
 */
export async function sendCodeEmail(email) {
  const res = await fetch('/api/auth/send-code', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
}
