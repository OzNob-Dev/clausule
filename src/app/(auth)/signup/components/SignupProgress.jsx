'use client'

import { usePathname } from 'next/navigation'

const STEPS = ['Account', 'Plan', 'Done']

export default function SignupProgress({ mobile = false }) {
  const p = usePathname()
  const step = p.endsWith('/done') ? 3 : p.endsWith('/plan') ? 2 : 1

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
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <polyline points="3 8 6 11 13 4" />
                    </svg>
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
