'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CtaBtn } from './SignupButtons'
import { ArrowIcon, CheckIcon } from './SignupIcons'

const NEXT_STEPS = [
  { label: 'Add your first brag doc entry', desc: '— log a win from this week, with evidence.' },
  { label: 'Generate your resume', desc: '— your CV is ready the moment you have entries.' },
  { label: 'Invite your manager', desc: '— they can add file notes on their side, you see nothing confidential.' },
]

export default function SignupStepDone({ email }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const handleEnter = async () => {
    setBusy(true)
    try {
      router.push('/brag')
    } catch {
      router.push('/')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="su-success-ring">
        <svg viewBox="0 0 34 34" fill="none" stroke="#F5F0EA" strokeWidth="2.5" strokeLinecap="round" style={{ width: 34, height: 34 }}>
          <polyline points="7 17 13 23 27 11" />
        </svg>
      </div>

      <div className="su-step-heading">You're in.</div>
      <div className="su-step-sub su-done-sub">
        Your Clausule account is ready. We've sent a confirmation to <strong>{email || 'you@email.com'}</strong>.
      </div>

      <div className="su-includes">
        <div className="su-includes-label">What to do next</div>
        <div className="su-includes-list">
          {NEXT_STEPS.map((step) => (
            <div key={step.label} className="su-include-item">
              <div className="su-check-circle su-check-circle--acc"><CheckIcon /></div>
              <div><strong>{step.label}</strong> {step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <CtaBtn onClick={handleEnter} disabled={busy}>
        {busy ? 'Loading ...' : 'Go to my dashboard'} <ArrowIcon />
      </CtaBtn>
      <div className="su-questions-note">
        Questions? <a href="mailto:help@clausule.com">help@clausule.com</a>
      </div>
    </div>
  )
}
