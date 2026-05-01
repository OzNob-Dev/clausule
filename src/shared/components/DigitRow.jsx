import { FieldInput } from '@shared/components/ui/Field'

const VARIANTS = {
  mfa: {
    row: 'mfa-otp-row mb-[14px] flex gap-2.5 max-[480px]:gap-2',
    box: 'mfa-otp-box h-[58px] w-[50px] rounded-xl border-2 border-[var(--cl-border-5)] bg-[var(--cl-surface-paper)] text-center text-[24px] font-extrabold text-[var(--cl-surface-ink)] caret-[var(--acc)] outline-none transition-[border-color,box-shadow,background] duration-150 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:border-[var(--acc)] focus:shadow-[0_0_0_3px_var(--cl-accent-soft-13)] max-[480px]:h-[50px] max-[480px]:w-[42px] max-[480px]:rounded-[10px] max-[480px]:text-[var(--cl-title-sm)]',
    error: 'mfa-otp-row--error [&_.mfa-otp-box]:animate-[mfa-shake_0.4s_ease] [&_.mfa-otp-box]:border-[var(--cl-danger-3)]',
    done: 'mfa-otp-row--valid [&_.mfa-otp-box]:border-[var(--cl-success-3)] [&_.mfa-otp-box]:bg-[var(--cl-success-soft-2)]',
  },
  bss: {
    row: 'bss-otp-row flex gap-2',
    box: 'bss-otp-box h-11 w-10 rounded-lg border-[1.5px] border-[var(--cl-border-dark-4)] bg-[var(--cl-surface-warm)] text-center text-[var(--cl-title-sm)] font-extrabold text-[var(--cl-surface-ink-3)] outline-none transition-[border-color,box-shadow,background] duration-150 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:border-[var(--cl-accent-deep)] focus:shadow-[0_0_0_3px_var(--cl-accent-soft-13)]',
    error: 'bss-otp-row--error [&_.bss-otp-box]:border-[var(--cl-danger-5)]',
    done: 'bss-otp-row--done [&_.bss-otp-box]:border-[var(--cl-success-3)] [&_.bss-otp-box]:bg-[var(--cl-success-soft-2)]',
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
