import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

/**
 * Sends a verification code email via EmailJS.
 * Template variables expected: {{to_email}}, {{code}}
 */
export async function sendCodeEmail(toEmail, code) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('[sendCodeEmail] EmailJS env vars not set — skipping send')
    return
  }

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    { to_email: toEmail, code },
    { publicKey: PUBLIC_KEY },
  )
}
