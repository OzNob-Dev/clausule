import { cn } from '@shared/utils/cn'
import { mfaUi } from './mfaClasses'

const VARIANTS = {
  mfa: {
    row: mfaUi.otpRow,
    box: mfaUi.otpBox,
    error: mfaUi.otpRowError,
    done: mfaUi.otpRowDone,
  },
  bss: {
    row: mfaUi.otpRow,
    box: mfaUi.otpBox,
    error: mfaUi.otpRowError,
    done: mfaUi.otpRowDone,
  },
}

export default function DigitRow({ digits, inputRefs, inputState, onChange, onKeyDown, onPaste, variant = 'mfa', ariaLabel = '6-digit code' }) {
  const classes = VARIANTS[variant] ?? VARIANTS.mfa

  return (
    <div
      className={cn(classes.row, inputState === 'error' && classes.error, inputState === 'done' && classes.done)}
      onPaste={onPaste}
      role="group"
      aria-label={ariaLabel}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => { inputRefs.current[index] = element }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={digit}
          onChange={(event) => onChange(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          className={classes.box}
          aria-label={`Digit ${index + 1} of 6`}
          autoFocus={index === 0}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          disabled={inputState === 'done' || inputState === 'checking'}
        />
      ))}
    </div>
  )
}
