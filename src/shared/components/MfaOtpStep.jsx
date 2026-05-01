import { CodeEmail } from '@shared/components/ui/CodeEmail'
import { Button } from '@shared/components/ui/Button'
import { MailIcon } from '@shared/components/ui/icon/MailIcon'
import DigitRow from './DigitRow'

export default function MfaOtpStep({
  email,
  otp,
  otpRefs,
  otpState,
  resendTimer,
  onChange,
  onKeyDown,
  onPaste,
  onResend,
}) {
  return (
    <div className="mfa-pane flex animate-[mfa-in_0.28s_cubic-bezier(0.25,0.46,0.45,0.94)_both] flex-col items-center text-center" key="otp">
      <div className="mfa-icon mb-[22px] flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[18px] bg-[var(--cl-accent-soft-2)] text-[var(--acc)] [&_svg]:h-7 [&_svg]:w-7" aria-hidden="true">
        <MailIcon />
      </div>
      <h1 className="mfa-heading mb-2.5 text-[23px] font-black leading-[1.2] tracking-[-0.5px] text-[var(--cl-surface-ink)] max-[480px]:text-[var(--cl-title-sm)]">Check your email</h1>
      <p className="mfa-sub mb-7 max-w-[320px] text-[var(--cl-text-base)] leading-[1.7] text-[var(--cl-surface-muted-3)] [&_strong]:font-bold [&_strong]:text-[var(--cl-surface-ink)]">
        We sent a 6-digit code to <strong>{email}</strong>
      </p>
      <CodeEmail to={email} />
      <DigitRow
        digits={otp}
        inputState={otpState}
        inputRefs={otpRefs}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
      />
      {otpState === 'error' ? <p className="mfa-error mb-2.5 text-[var(--cl-text-sm)] font-semibold text-[var(--cl-danger-3)]" role="alert">Incorrect code — try again</p> : null}
      <p className="mfa-resend mt-1 text-[var(--cl-text-sm)] text-[var(--cl-surface-muted-6)]">
        {resendTimer > 0 ? (
          <span>Resend in {resendTimer}s</span>
        ) : (
          <Button type="button" variant="ghost" className="mfa-resend-btn border-0 bg-transparent p-0 text-[var(--cl-text-sm)] font-bold text-[var(--acc)] shadow-none hover:bg-transparent hover:opacity-75 hover:translate-y-0" onClick={onResend}>Resend code</Button>
        )}
      </p>
    </div>
  )
}
