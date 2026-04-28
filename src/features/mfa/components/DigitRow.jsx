import { FieldInput } from '@shared/components/ui/Field'

const VARIANTS = {
  mfa: {
    row: 'mfa-otp-row',
    box: 'mfa-otp-box',
    error: 'mfa-otp-row--error',
    done: 'mfa-otp-row--valid',
  },
  bss: {
    row: 'bss-otp-row',
    box: 'bss-otp-box',
    error: 'bss-otp-row--error',
    done: 'bss-otp-row--done',
  },
}

export default function DigitRow({ digits, inputRefs, inputState, onChange, onKeyDown, onPaste, variant = 'mfa', ariaLabel = '6-digit code' }) {
  const classes = VARIANTS[variant] ?? VARIANTS.mfa

  return (
    <div
      className={[
        classes.row,
        inputState === 'error' ? classes.error : '',
        inputState === 'done' ? classes.done : '',
      ].join(' ')}
      onPaste={onPaste}
      role="group"
      aria-label={ariaLabel}
    >
      {digits.map((digit, index) => (
        <FieldInput
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
