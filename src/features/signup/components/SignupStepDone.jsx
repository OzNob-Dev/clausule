'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@shared/utils/routes'
import { CtaBtn } from './SignupButtons'
import { ArrowIcon, CheckIcon } from './SignupIcons'
import { signupUi } from './signupClasses'

const NEXT_STEPS = [
  { label: 'Set up MFA', desc: '- ensure your account is secure.' },
  { label: 'Add your first brag doc entry', desc: '- log a win from this week, with evidence.' },
  { label: 'Generate your resume', desc: '- your CV is ready the moment you have entries.' },
]

export default function SignupStepDone({ email }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const handleEnter = async () => {
    setBusy(true)
    try {
      router.push(ROUTES.bragSettings)
    } catch {
      router.push('/')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className={signupUi.successRing}>
        <svg viewBox="0 0 34 34" fill="none" stroke="#F5F0EA" strokeWidth="2.5" strokeLinecap="round" style={{ width: 34, height: 34 }}>
          <polyline points="7 17 13 23 27 11" />
        </svg>
      </div>

      <div className={signupUi.heading}>You're in.</div>
      <div className={`${signupUi.sub} ${signupUi.doneSub}`}>
        Your Clausule account is ready. We've sent a confirmation to <strong>{email || 'you@email.com'}</strong>.
      </div>

      <div className={signupUi.includes}>
        <div className={signupUi.includesLabel}>What to do next</div>
        <div className={signupUi.includesList}>
          {NEXT_STEPS.map((step) => (
            <div key={step.label} className={signupUi.includeItem}>
              <div className={signupUi.checkCircle}><CheckIcon /></div>
              <div><strong>{step.label}</strong> {step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <CtaBtn onClick={handleEnter} disabled={busy}>
        {busy ? 'Loading ...' : 'Setup Multi-Factor Authentication'} <ArrowIcon />
      </CtaBtn>
      <div className={signupUi.questions}>
        Questions? <a href="mailto:help@clausule.com">help@clausule.com</a>
      </div>
    </div>
  )
}
