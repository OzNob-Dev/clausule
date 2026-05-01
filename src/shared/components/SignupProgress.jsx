'use client'

import { usePathname } from 'next/navigation'
import { CheckIcon } from '@shared/components/ui/icon/CheckIcon'

const STEPS = ['Account', 'Plan', 'Done']

function stepFromPath(pathname = '') {
  return pathname.endsWith('/done') ? 3 : pathname.endsWith('/plan') ? 2 : 1
}

export default function SignupProgress({ mobile = false, pathname = null }) {
  const currentPathname = usePathname()
  const step = stepFromPath(pathname ?? currentPathname ?? '')
  const navClassName = mobile
    ? 'su-progress su-progress--mobile hidden max-[640px]:flex max-[640px]:justify-center max-[640px]:pb-5'
    : 'su-progress su-progress--sidebar pt-6 max-[640px]:hidden'
  const listClassName = mobile
    ? 'su-progress-inner m-0 flex w-full list-none items-center p-0'
    : 'su-progress-inner m-0 flex list-none flex-col gap-2.5 p-0'

  return (
    <nav className={navClassName} aria-label="Signup progress">
      <ol className={listClassName}>
        {STEPS.map((label, index) => {
          const stepNumber = index + 1
          const done = stepNumber < step
          const active = stepNumber === step
          const circleClassName = mobile
            ? `su-step-circle flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[var(--cl-text-xs)] font-extrabold transition-all max-[640px]:h-7 max-[640px]:w-7 ${
                done
                  ? 'su-step-circle--done border-[var(--su-tx1)] bg-[var(--su-tx1)] text-[var(--su-canvas)]'
                  : active
                    ? 'su-step-circle--active border-[var(--su-acc)] bg-[var(--su-acc)] text-[var(--cl-surface-paper)]'
                    : 'border-[var(--su-border-em)] bg-[var(--su-panel)] text-[var(--su-tx3)]'
              }`
            : `su-step-circle flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-0 text-[var(--cl-text-2xs)] font-extrabold transition-all ${
                done
                  ? 'su-step-circle--done bg-[var(--cl-accent-alpha-25)] text-[var(--cl-accent-strong)]'
                  : active
                    ? 'su-step-circle--active bg-[var(--cl-accent-strong)] text-[var(--cl-white)]'
                    : 'bg-[var(--cl-white-8)] text-[var(--cl-muted-10)]'
              }`
          const labelClassName = mobile
            ? `su-step-label text-[var(--cl-text-2xs)] font-bold uppercase tracking-[0.6px] max-[420px]:hidden ${
                active ? 'su-step-label--active text-[var(--su-tx2)]' : done ? 'su-step-label--done text-[var(--su-tx4)]' : 'text-[var(--su-tx4)]'
              }`
            : `su-step-label text-[var(--cl-text-sm)] font-semibold ${
                active ? 'su-step-label--active text-[var(--cl-surface-muted-10)]' : done ? 'su-step-label--done text-[var(--cl-surface-muted-8)]' : 'text-[var(--cl-surface-muted-8)]'
              }`

          return (
            <li key={label} className={mobile ? 'su-step-wrap contents' : 'su-step-wrap flex flex-col'}>
              <div className={mobile ? 'su-step-item flex flex-col items-center gap-[5px]' : 'su-step-item flex flex-row items-center gap-2.5'}>
                <div className={circleClassName} aria-hidden="true">
                  {done ? (
                    <CheckIcon />
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className={labelClassName} aria-current={active ? 'step' : undefined}>
                  {label}
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`su-step-connector ${
                    mobile
                      ? `mx-2 h-[1.5px] flex-1 ${done ? 'su-step-connector--done bg-[var(--su-tx1)]' : 'bg-[var(--su-border-em)]'}`
                      : `my-0.5 ml-[9px] h-3.5 w-[1.5px] ${done ? 'su-step-connector--done bg-[var(--su-tx1)]' : 'bg-[var(--su-border-em)]'}`
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
