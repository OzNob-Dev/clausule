'use client'
import './SignupProgress.css'

import { usePathname } from 'next/navigation'
import { CheckIcon } from '@shared/components/ui/icon/CheckIcon'

const STEPS = ['Account', 'Plan', 'Done']

function stepFromPath(pathname = '') {
  return pathname.endsWith('/done') ? 3 : pathname.endsWith('/plan') ? 2 : 1
}

export default function SignupProgress({ mobile = false, pathname = null }) {
  const currentPathname = usePathname()
  const step = stepFromPath(pathname ?? currentPathname ?? '')

  return (
    <nav className={`su-progress${mobile ? ' su-progress--mobile' : ' su-progress--sidebar'}`} aria-label="Signup progress">
      <ol className="su-progress-inner">
        {STEPS.map((label, index) => {
          const stepNumber = index + 1
          const done = stepNumber < step
          const active = stepNumber === step

          return (
            <li key={label} className="su-step-wrap">
              <div className="su-step-item">
                <div className={`su-step-circle${done ? ' su-step-circle--done' : active ? ' su-step-circle--active' : ''}`} aria-hidden="true">
                  {done ? (
                    <CheckIcon />
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className={`su-step-label${active ? ' su-step-label--active' : done ? ' su-step-label--done' : ''}`} aria-current={active ? 'step' : undefined}>
                  {label}
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`su-step-connector${done ? ' su-step-connector--done' : ''}`} aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
