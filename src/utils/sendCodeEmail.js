/**
 * Sends a verification code email via /api/send-code (Brevo, server-side).
 */
export async function sendCodeEmail(toEmail, code) {
  const res = await fetch('/api/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: toEmail, code }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
}
