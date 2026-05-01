'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@shared/utils/routes'
import { Link } from '@shared/components/ui/Link'
import { CtaBtn } from '@shared/components/ui/SignupButtons'
import { ArrowIcon } from '@shared/components/ui/icon/ArrowIcon'
import { CheckIcon } from '@shared/components/ui/icon/CheckIcon'

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
      <div className="su-success-ring mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,var(--su-acc),color-mix(in_srgb,var(--su-acc)_72%,white)_58%,transparent_59%),linear-gradient(180deg,color-mix(in_srgb,var(--su-panel)_92%,white),var(--su-panel))] text-[var(--su-canvas)] shadow-[0_18px_45px_var(--cl-accent-alpha-25)]">
        <CheckIcon size={34} strokeWidth={2.5} />
      </div>

      <div className="su-step-heading">You're in.</div>
      <div className="su-step-sub su-done-sub mb-7">
        Your Clausule account is ready. We've sent a confirmation to <strong className="text-[var(--su-tx1)]">{email || 'you@email.com'}</strong>.
      </div>

      <div className="su-includes mb-7 rounded-[var(--su-r2)] bg-[var(--su-panel)] px-5 py-[18px]">
        <div className="su-includes-label mb-3 text-[var(--cl-text-2xs)] font-bold uppercase tracking-[0.8px] text-[var(--su-tx3)]">What to do next</div>
        <ul className="su-includes-list m-0 flex list-none flex-col gap-2 p-0">
          {NEXT_STEPS.map((step) => (
            <li key={step.label} className="su-include-item flex items-start gap-2.5 text-[var(--cl-text-md)] leading-[1.5] text-[var(--su-tx2)]">
              <div className="su-check-circle su-check-circle--acc mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--su-acc)] text-[var(--su-canvas)]" aria-hidden="true"><CheckIcon /></div>
              <div><strong>{step.label}</strong> {step.desc}</div>
            </li>
          ))}
        </ul>
      </div>

      <CtaBtn onClick={handleEnter} disabled={isPending}>
        {isPending ? 'Loading…' : 'Set up multi-factor authentication'} <ArrowIcon />
      </CtaBtn>
      <div className="su-questions-note mt-4 text-center text-[var(--cl-text-sm)] leading-[1.6] text-[var(--su-tx3)]">
        Questions? <Link href="mailto:help@clausule.com" className="text-[var(--su-tx3)] hover:text-[var(--su-tx1)]">help@clausule.com</Link>
      </div>
    </div>
  )
}
