import DigitRow from './DigitRow'
import { Button } from '@shared/components/ui/Button'
import { maskEmail } from '@mfa/utils/maskEmail'
import { BackIcon } from '@shared/components/ui/icon/BackIcon'
import { BrandMarkIcon } from '@shared/components/ui/icon/BrandMarkIcon'
import { CheckIcon } from '@shared/components/ui/icon/CheckIcon'
import { MailIcon } from '@shared/components/ui/icon/MailIcon'

export default function MfaLoginEmailStep({
  email,
  otp,
  otpRefs,
  otpState,
  errorMessage,
  expirySeconds,
  resendTimer,
  onChange,
  onKeyDown,
  onPaste,
  onVerify,
  onResend,
  onBack,
  onSetupApp,
}) {
  const mins = Math.floor(expirySeconds / 60)
  const secs = String(expirySeconds % 60).padStart(2, '0')
  const codeReady = otp.every(Boolean)
  const stepNumBase = 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--cl-white-8)] text-[var(--cl-text-2xs)] font-extrabold text-[var(--cl-surface-muted-11)]'

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[var(--cl-surface-warm)] px-6 py-6 text-[var(--cl-surface-ink-3)] before:pointer-events-none before:absolute before:inset-0 before:bg-[repeating-linear-gradient(to_bottom,transparent,transparent_47px,var(--cl-rule-dark)_47px,var(--cl-rule-dark)_48px)]">
      <div className="relative z-[1] flex w-[780px] max-w-full overflow-hidden rounded-[var(--cl-radius-md)] border border-[var(--cl-border-dark-4)] bg-[var(--cl-surface-paper-2)] shadow-[0_24px_60px_rgba(0,0,0,0.08)] max-[780px]:flex-col">
        <section className="flex w-64 shrink-0 flex-col justify-between gap-9 bg-[var(--cl-surface-ink)] px-7 py-8 max-[780px]:w-full" aria-label="Sign-in progress">
          <div className="flex items-center gap-[9px]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--cl-radius-md)] bg-[var(--cl-accent-strong)] text-[var(--cl-surface-paper)] [&_svg]:h-[15px] [&_svg]:w-[15px]" aria-hidden="true">
              <BrandMarkIcon />
            </div>
            <div className="text-[var(--cl-text-lg)] font-black text-[var(--cl-surface-paper)]">clausule</div>
          </div>

          <div className="flex flex-col gap-3.5">
            <h1 className="[font-family:var(--font-serif)] text-[var(--cl-title-lg)] leading-[1.2] text-[var(--cl-surface-paper)]">
              Check your<br /><em className="text-[var(--cl-accent-strong)]">inbox</em>
            </h1>
            <p className="text-[var(--cl-text-md)] leading-[1.7] text-[var(--cl-surface-muted-11)]">A one-time code was sent to your email. Enter it to continue signing in.</p>
            <div className="mt-1 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 text-[var(--cl-text-sm)] font-semibold text-[var(--cl-surface-muted-8)]">
                <span className={`${stepNumBase} bg-[var(--cl-accent-alpha-25)] text-[var(--cl-accent-strong)]`} aria-hidden="true">✓</span>
                <span>Email entered</span>
              </div>
              <div className="flex items-center gap-2.5 text-[var(--cl-text-sm)] font-semibold text-[var(--cl-surface-muted-8)]">
                <span className={`${stepNumBase} bg-[var(--cl-accent-strong)] text-white`} aria-hidden="true">2</span>
                <span className="text-[var(--cl-surface-muted-11)]" aria-current="step">Verify code</span>
              </div>
              <div className="flex items-center gap-2.5 text-[var(--cl-text-sm)] font-semibold text-[var(--cl-surface-muted-8)]">
                <span className={stepNumBase} aria-hidden="true">3</span>
                <span>Access granted</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-w-0 flex-1 flex-col justify-center bg-[var(--cl-surface-paper-2)] px-8 py-9 max-[780px]:px-6 max-[780px]:py-7">
          <Button type="button" variant="ghost" className="mfa-email-back inline-flex self-start gap-1.5 rounded px-0 py-0 text-[var(--cl-text-sm)] font-bold text-[var(--cl-surface-muted-8)] shadow-none hover:text-[var(--cl-surface-ink-3)] focus-visible:outline-[var(--cl-accent-strong)] [&_svg]:h-[13px] [&_svg]:w-[13px]" onClick={onBack} aria-label="Back to sign in">
            <BackIcon />
            Back
          </Button>

          <h2 className="mb-1 mt-6 text-[var(--cl-title-md)] font-black text-[var(--cl-surface-ink-3)]">Verify your code</h2>
          <p className="mb-[18px] text-[var(--cl-text-md)] leading-[1.65] text-[var(--cl-surface-muted-4)]">
            Enter the 6-digit code we sent to <strong className="text-[var(--cl-surface-ink-3)]">{maskEmail(email)}</strong>. It expires in 10 minutes.
          </p>

          <div className="mb-[22px] overflow-hidden rounded-[var(--cl-radius-md)] border border-[var(--cl-border-dark-4)] bg-[var(--cl-surface-warm)]" role="img" aria-label="Example of the email you received">
            <div className="flex items-center gap-2 border-b border-[var(--cl-border-dark)] bg-[var(--cl-surface-muted-17)] px-3 py-[9px]">
              <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[var(--cl-radius-sm)] bg-[var(--cl-surface-ink-3)] text-[var(--cl-surface-warm)] [&_svg]:h-[11px] [&_svg]:w-[11px]" aria-hidden="true">
                <MailIcon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[var(--cl-text-2xs)] font-bold text-[var(--cl-surface-ink-3)]">noreply@clausule.com</div>
                <div className="truncate text-[var(--cl-text-2xs)] font-medium text-[var(--cl-surface-muted-8)]">Your Clausule sign-in code</div>
              </div>
              <div className="text-[var(--cl-text-2xs)] text-[var(--cl-surface-muted-8)]">Just now</div>
            </div>
            <div className="px-4 py-4">
              <p className="mb-3 text-[var(--cl-text-sm)] text-[var(--cl-surface-ink-3)]">Hi there, here's your one-time sign-in code for Clausule.</p>
              <div className="mb-3 flex items-center gap-[6px]" aria-label="6-digit code placeholder">
                {Array.from({ length: 3 }).map((_, index) => (
                  <span key={`a-${index}`} className="flex h-9 w-8 items-center justify-center rounded-[var(--cl-radius-sm)] border-[1.5px] border-[var(--cl-border-dark-4)] bg-[var(--cl-surface-paper)] text-[var(--cl-title-sm)] font-extrabold text-[var(--cl-surface-ink-3)]" aria-hidden="true">*</span>
                ))}
                <span className="h-px w-3 bg-[var(--cl-surface-muted-8)]" aria-hidden="true" />
                {Array.from({ length: 3 }).map((_, index) => (
                  <span key={`b-${index}`} className="flex h-9 w-8 items-center justify-center rounded-[var(--cl-radius-sm)] border-[1.5px] border-[var(--cl-border-dark-4)] bg-[var(--cl-surface-paper)] text-[var(--cl-title-sm)] font-extrabold text-[var(--cl-surface-ink-3)]" aria-hidden="true">*</span>
                ))}
              </div>
              <div className="text-[var(--cl-text-2xs)] leading-[1.5] text-[var(--cl-surface-muted-8)]">Valid for <strong className="text-[var(--cl-surface-ink-3)]">10 minutes</strong>. Never share this code.</div>
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between gap-4 text-[var(--cl-text-xs)] font-bold text-[var(--cl-surface-muted-8)]">
            <span id="mfa-email-otp-label">Enter code</span>
            {expirySeconds > 0 ? (
              <span>Expires in <strong aria-live="polite" className="text-[var(--cl-surface-ink-3)]">{mins}:{secs}</strong></span>
            ) : (
              <strong className="text-[var(--cl-danger-5)]">Code expired</strong>
            )}
          </div>

          <DigitRow
            digits={otp}
            inputState={otpState}
            inputRefs={otpRefs}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            ariaLabel="Enter code"
          />

          {(otpState === 'error' || errorMessage) && (
            <p className="mfa-error" role="alert">{errorMessage || 'Incorrect code — try again'}</p>
          )}

          <Button
            type="button"
            variant="primary"
            className="mfa-email-verify mt-1 min-h-[50px] rounded-xl text-[var(--cl-text-base)] font-bold shadow-none focus-visible:outline-[var(--cl-accent-strong)]"
            onClick={onVerify}
            disabled={!codeReady || otpState === 'checking' || otpState === 'done' || expirySeconds <= 0}
            aria-label="Verify your code"
          >
            <CheckIcon />
            Verify code
          </Button>

          <div className="mt-5 space-y-2 text-[var(--cl-text-sm)] leading-[1.6] text-[var(--cl-surface-muted-8)]">
            <p>
              Didn't get it?{' '}
              {resendTimer > 0 ? (
                <span>Resend in {resendTimer}s</span>
              ) : (
                <Button type="button" variant="ghost" className="mfa-email-resend inline-flex px-0 py-0 text-[var(--cl-accent-deep)] shadow-none hover:text-[var(--cl-accent-deeper)]" onClick={onResend}>Resend code</Button>
              )}
            </p>
            {onSetupApp && (
              <p>
                Want more security?{' '}
                <Button type="button" variant="ghost" className="mfa-email-resend inline-flex px-0 py-0 text-[var(--cl-accent-deep)] shadow-none hover:text-[var(--cl-accent-deeper)]" onClick={onSetupApp}>Set up an authenticator app</Button>
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
