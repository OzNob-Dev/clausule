import { cn } from '@shared/utils/cn'
import { signupUi } from './signupClasses'

const STEPS = ['Account', 'Payment', 'Done']

export default function SignupProgress({ step }) {
  return (
    <div className={signupUi.progressWrap}>
      <div className={signupUi.progressInner}>
        {STEPS.map((label, index) => {
          const stepNumber = index + 1
          const done = stepNumber < step
          const active = stepNumber === step

          return (
            <div key={label} className={signupUi.progressTrack}>
              <div className={signupUi.progressItem}>
                <div className={cn(signupUi.progressCircle, done && signupUi.progressCircleDone, active && signupUi.progressCircleActive)}>
                  {done ? (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 12, height: 12 }}>
                      <polyline points="3 8 6 11 13 4" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className={cn(signupUi.progressLabel, done && signupUi.progressLabelDone, active && signupUi.progressLabelActive)}>
                  {label}
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn(signupUi.progressConnector, done && signupUi.progressConnectorDone)} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
