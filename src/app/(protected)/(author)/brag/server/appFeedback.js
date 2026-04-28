import { BrevoClient } from '@getbrevo/brevo'
import { insert, select } from '@api/_lib/supabase.js'
import { withTimeout } from '@api/_lib/network.js'

const CATEGORIES = new Set(['Bug', 'Idea', 'Usability', 'Other'])
const FEELINGS = new Set(['Love it', 'Confusing', 'Blocked', 'Just noting'])
const MAX_SUBJECT_LENGTH = 160
const MAX_MESSAGE_LENGTH = 4000
const MAX_IMPROVEMENT_LENGTH = 2000

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
  if (subject.length > MAX_SUBJECT_LENGTH) return { body: { error: 'subject is too long' }, status: 400 }
  if (message.length > MAX_MESSAGE_LENGTH) return { body: { error: 'message is too long' }, status: 400 }
  if (improvement.length > MAX_IMPROVEMENT_LENGTH) return { body: { error: 'improvement is too long' }, status: 400 }

  const { data: feedbackRows, error: insertError } = await insert('app_feedback', {
    user_id: user.userId,
    user_email: user.email ?? null,
    category,
    feeling,
    subject,
    message,
    improvement: improvement || null,
    contact_ok: contactOk,
  }, { expectRows: 'single' })

  if (insertError) {
    return { log: ['[feedback] audit insert error:', insertError], body: { error: 'Failed to save feedback' }, status: 500 }
  }

  const feedback = { ...(feedbackRows?.[0] ?? {}), replies: [] }
  if (!process.env.BREVO_API_KEY) {
    return { log: ['[feedback] BREVO_API_KEY not set'], body: { ok: true, feedback }, status: 200 }
  }

  try {
    const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY })
    await withTimeout(
      () => client.transactionalEmails.sendTransacEmail({
        subject: `Clausule feedback: ${subject}`,
        sender: { name: 'Clausule', email: 'noreply@clausule.app' },
        to: [{ email: toEmail }],
        htmlContent: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:28px 24px;background:#FAF7F3;border-radius:12px;color:#1A1510;">
            <p style="margin:0 0 8px;color:#5C5048;font-size:13px;">Product feedback</p>
            <h2 style="margin:0 0 18px;font-size:22px;">${escapeHtml(subject)}</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
              <tr><td style="padding:8px 0;color:#5C5048;">From</td><td style="padding:8px 0;text-align:right;">${escapeHtml(user.email || user.userId)}</td></tr>
              <tr><td style="padding:8px 0;color:#5C5048;">Category</td><td style="padding:8px 0;text-align:right;">${escapeHtml(category)}</td></tr>
              <tr><td style="padding:8px 0;color:#5C5048;">Feeling</td><td style="padding:8px 0;text-align:right;">${escapeHtml(feeling)}</td></tr>
              <tr><td style="padding:8px 0;color:#5C5048;">May contact</td><td style="padding:8px 0;text-align:right;">${contactOk ? 'Yes' : 'No'}</td></tr>
            </table>
            <h3 style="margin:0 0 8px;font-size:15px;">Feedback</h3>
            <p style="white-space:pre-wrap;margin:0 0 18px;line-height:1.6;color:#3D3228;">${escapeHtml(message)}</p>
            ${improvement ? `<h3 style="margin:0 0 8px;font-size:15px;">What would make it better</h3><p style="white-space:pre-wrap;margin:0;line-height:1.6;color:#3D3228;">${escapeHtml(improvement)}</p>` : ''}
          </div>
        `,
      }),
      { timeoutMs: 10_000, timeoutLabel: 'Brevo feedback owner email' }
    )

    if (user.email) {
      await withTimeout(
        () => client.transactionalEmails.sendTransacEmail({
          subject: 'Clausule received your feedback',
          sender: { name: 'Clausule', email: 'noreply@clausule.app' },
          to: [{ email: user.email }],
          htmlContent: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:28px 24px;background:#FAF7F3;border-radius:12px;color:#1A1510;">
              <p style="margin:0 0 8px;color:#7F351F;font-size:13px;font-weight:700;">Feedback received</p>
              <h2 style="margin:0 0 14px;font-size:22px;">Your note made it through.</h2>
              <p style="margin:0 0 18px;line-height:1.6;color:#3D3228;">Thanks for helping sharpen Clausule. The team has your feedback and can follow up at this email if you said that was okay.</p>
              <div style="padding:14px 16px;background:#FFFFFF;border:1px solid rgba(60,45,35,0.12);border-radius:10px;">
                <p style="margin:0 0 6px;color:#5C5048;font-size:13px;">You sent</p>
                <p style="margin:0;font-weight:700;">${escapeHtml(subject)}</p>
              </div>
            </div>
          `,
        }),
        { timeoutMs: 10_000, timeoutLabel: 'Brevo feedback receipt email' }
      )
    }
  } catch (err) {
    return { log: ['[feedback] Brevo error:', err?.message ?? err], body: { ok: true, feedback }, status: 200 }
  }

  return { body: { ok: true, feedback }, status: 200 }
}

export async function listAppFeedback({ userId }) {
  const query = new URLSearchParams({
    user_id: `eq.${userId}`,
    order: 'created_at.desc',
    select: 'id,category,feeling,subject,message,improvement,contact_ok,created_at,app_feedback_replies(id,author_name,body,from_team,created_at)',
  })
  const { data, error } = await select('app_feedback', query.toString())
  if (error) return { log: ['[feedback] list error:', error], body: { error: 'Failed to fetch feedback' }, status: 500 }

  return {
    body: {
      feedback: (data ?? []).map((thread) => ({
        ...thread,
        replies: (thread.app_feedback_replies ?? []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
        app_feedback_replies: undefined,
      })),
    },
    status: 200,
  }
}
