import { BrevoClient } from '@getbrevo/brevo'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const { to, code } = await request.json().catch(() => ({}))

  if (!to || !code) {
    return NextResponse.json({ error: 'Missing to or code' }, { status: 400 })
  }

  if (!process.env.BREVO_API_KEY) {
    return NextResponse.json({ error: 'BREVO_API_KEY not configured' }, { status: 500 })
  }

  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY })

  const digitBoxes = code
    .split('')
    .map(
      (d) => `<span style="
        display:inline-flex;align-items:center;justify-content:center;
        width:44px;height:52px;border-radius:8px;
        background:#fff;border:1.5px solid rgba(208,90,52,0.35);
        font-size:22px;font-weight:800;color:#C0532A;
        font-family:monospace;
      ">${d}</span>`
    )
    .join('')

  try {
    await client.transactionalEmails.sendTransacEmail({
      subject: 'Your Clausule sign-in code',
      sender: { name: 'Clausule', email: 'noreply@clausule.app' },
      to: [{ email: to }],
      htmlContent: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#FAF7F3;border-radius:12px;">
          <h2 style="margin:0 0 8px;font-size:20px;color:#2A221A;">Your sign-in code</h2>
          <p style="color:#5C5048;margin:0 0 24px;">Use the code below to sign in to Clausule. It expires in 10 minutes.</p>
          <div style="display:flex;gap:8px;margin-bottom:24px;">${digitBoxes}</div>
          <p style="color:#8A7E76;font-size:13px;margin:0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[send-code] Brevo error:', err?.message ?? err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 502 })
  }
}
