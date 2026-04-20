import { BrevoClient } from '@getbrevo/brevo'
import { insert } from '@api/_lib/supabase.js'

const CATEGORIES = new Set(['Bug', 'Idea', 'Usability', 'Other'])
const FEELINGS = new Set(['Love it', 'Confusing', 'Blocked', 'Just noting'])

function clean(value) {
  return String(value ?? '').trim()
}

function escapeHtml(value) {
  return clean(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function sendAppFeedback({ body, user }) {
  const category = CATEGORIES.has(body.category) ? body.category : 'Other'
  const feeling = FEELINGS.has(body.feeling) ? body.feeling : 'Just noting'
  const subject = clean(body.subject)
  const message = clean(body.message)
  const improvement = clean(body.improvement)
  const contactOk = body.contactOk === true
  const toEmail = process.env.APP_FEEDBACK_EMAIL || process.env.SUPPORT_EMAIL || 'support@clausule.app'

  if (!subject) return { body: { error: 'subject is required' }, status: 400 }
  if (!message) return { body: { error: 'message is required' }, status: 400 }

  const { error: insertError } = await insert('app_feedback', {
    user_id: user.userId,
    user_email: user.email ?? null,
    category,
    feeling,
    subject,
    message,
    improvement: improvement || null,
    contact_ok: contactOk,
  })

  if (insertError) {
    return { log: ['[feedback] audit insert error:', insertError], body: { error: 'Failed to save feedback' }, status: 500 }
  }

  if (!process.env.BREVO_API_KEY) {
    return { log: ['[feedback] BREVO_API_KEY not set'], body: { error: 'Feedback service not configured' }, status: 500 }
  }

  try {
    const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY })
    await client.transactionalEmails.sendTransacEmail({
      subject: `Clausule feedback: ${subject}`,
      sender: { name: 'Clausule', email: 'noreply@clausule.app' },
      to: [{ email: toEmail }],
      htmlContent: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:28px 24px;background:#FAF7F3;border-radius:12px;color:#1A1510;">
          <p style="margin:0 0 8px;color:#786B5F;font-size:13px;">Product feedback</p>
          <h2 style="margin:0 0 18px;font-size:22px;">${escapeHtml(subject)}</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
            <tr><td style="padding:8px 0;color:#786B5F;">From</td><td style="padding:8px 0;text-align:right;">${escapeHtml(user.email || user.userId)}</td></tr>
            <tr><td style="padding:8px 0;color:#786B5F;">Category</td><td style="padding:8px 0;text-align:right;">${escapeHtml(category)}</td></tr>
            <tr><td style="padding:8px 0;color:#786B5F;">Feeling</td><td style="padding:8px 0;text-align:right;">${escapeHtml(feeling)}</td></tr>
            <tr><td style="padding:8px 0;color:#786B5F;">May contact</td><td style="padding:8px 0;text-align:right;">${contactOk ? 'Yes' : 'No'}</td></tr>
          </table>
          <h3 style="margin:0 0 8px;font-size:15px;">Feedback</h3>
          <p style="white-space:pre-wrap;margin:0 0 18px;line-height:1.6;color:#3D3228;">${escapeHtml(message)}</p>
          ${improvement ? `<h3 style="margin:0 0 8px;font-size:15px;">What would make it better</h3><p style="white-space:pre-wrap;margin:0;line-height:1.6;color:#3D3228;">${escapeHtml(improvement)}</p>` : ''}
        </div>
      `,
    })
  } catch (err) {
    return { log: ['[feedback] Brevo error:', err?.message ?? err], body: { error: 'Failed to send feedback' }, status: 502 }
  }

  return { body: { ok: true }, status: 200 }
}
