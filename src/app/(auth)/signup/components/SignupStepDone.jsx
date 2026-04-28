'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@shared/utils/routes'
import { Link } from '@shared/components/ui/Link'
import { CtaBtn } from '@shared/components/ui/SignupButtons'
import { ArrowIcon, CheckIcon } from '@shared/components/ui/SignupIcons'

const NEXT_STEPS = [
  { label: 'Set up MFA', desc: '- ensure your account is secure.' },
  { label: 'Add your first brag doc entry', desc: '- log a win from this week, with evidence.' },
  { label: 'Generate your resume', desc: '- your CV is ready the moment you have entries.' },
]

export default function SignupStepDone({ email }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleEnter = () => {
    startTransition(() => {
      router.push(ROUTES.bragSettings)
    })
  }

  return (
    <div>
      <div className="su-success-ring">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#F5F0EA" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <polyline points="7 17 13 23 27 11" />
        </svg>
      </div>

      <div className="su-step-heading">You're in.</div>
      <div className="su-step-sub su-done-sub">
        Your Clausule account is ready. We've sent a confirmation to <strong>{email || 'you@email.com'}</strong>.
      </div>

      <div className="su-includes">
        <div className="su-includes-label">What to do next</div>
        <ul className="su-includes-list">
          {NEXT_STEPS.map((step) => (
            <li key={step.label} className="su-include-item">
              <div className="su-check-circle su-check-circle--acc" aria-hidden="true"><CheckIcon /></div>
              <div><strong>{step.label}</strong> {step.desc}</div>
            </li>
          ))}
        </ul>
      </div>

      <CtaBtn onClick={handleEnter} disabled={isPending}>
        {isPending ? 'Loading…' : 'Set up multi-factor authentication'} <ArrowIcon />
      </CtaBtn>
      <div className="su-questions-note">
        Questions? <Link href="mailto:help@clausule.com">help@clausule.com</Link>
      </div>
    </div>
  )
}
