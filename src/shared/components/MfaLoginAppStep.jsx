import DigitRow from './DigitRow'
import { Button } from '@shared/components/ui/Button'
import { maskEmail } from '@mfa/utils/maskEmail'
import { BackIcon } from '@shared/components/ui/icon/BackIcon'
import { BrandMarkIcon } from '@shared/components/ui/icon/BrandMarkIcon'
import { CheckIcon } from '@shared/components/ui/icon/CheckIcon'
import { DeviceLockIcon } from '@shared/components/ui/icon/DeviceLockIcon'

export default function MfaLoginAppStep({
  email,
  otp,
  otpRefs,
  otpState,
  errorMessage,
  onBack,
  onChange,
  onKeyDown,
  onPaste,
  onVerify,
  onUseRecovery,
}) {
  const codeReady = otp.every(Boolean)

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[var(--cl-surface-warm)] px-6 py-6 before:pointer-events-none before:absolute before:inset-0 before:bg-[repeating-linear-gradient(to_bottom,transparent,transparent_47px,var(--cl-rule-dark)_47px,var(--cl-rule-dark)_48px)]">
      <div className="relative z-[1] flex w-[780px] max-w-full overflow-hidden rounded-[var(--cl-radius-md)] border border-[var(--cl-border-dark-4)] bg-[var(--cl-surface-paper-2)] shadow-[0_24px_60px_rgba(0,0,0,0.08)] max-[780px]:flex-col">
        <section className="flex w-64 shrink-0 flex-col justify-between gap-9 bg-[var(--cl-surface-ink)] px-7 py-8 max-[780px]:w-full">
          <div className="flex items-center gap-[9px]" aria-label="Clausule">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--cl-accent-strong)] text-[var(--cl-surface-paper)] [&_svg]:h-[15px] [&_svg]:w-[15px]" aria-hidden="true">
              <BrandMarkIcon />
            </div>
            <div className="text-[var(--cl-text-lg)] font-black text-[var(--cl-surface-paper)]">clausule</div>
          </div>

          <div className="flex flex-col gap-3.5">
            <h1 className="[font-family:var(--font-serif)] text-[var(--cl-title-lg)] leading-[1.2] text-[var(--cl-surface-paper)]">Authenticator<br /><em className="text-[var(--cl-accent-strong)]">verification</em></h1>
            <p className="text-[var(--cl-text-md)] leading-[1.7] text-[var(--cl-surface-muted-11)]">Your app generates a fresh 6-digit code every 30 seconds.</p>
            <div className="flex flex-col gap-2.5 rounded-[var(--cl-radius-md)] border border-[var(--cl-white-7)] bg-[var(--cl-white-4)] p-3.5" aria-hidden="true">
              <div className="flex items-start gap-[9px] text-[var(--cl-text-xs)] leading-[1.5] text-[var(--cl-surface-muted-11)]">
                <div className="mt-px flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[var(--cl-radius-sm)] bg-[var(--cl-accent-alpha-20)] text-[var(--cl-accent-strong)] [&_svg]:h-[11px] [&_svg]:w-[11px]">
                  <DeviceLockIcon />
                </div>
                <div><strong className="text-[var(--cl-surface-paper)]">Refreshes every 30s</strong> — enter the current code shown in your app.</div>
              </div>
              <div className="flex items-start gap-[9px] text-[var(--cl-text-xs)] leading-[1.5] text-[var(--cl-surface-muted-11)]">
                <div className="mt-px flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[var(--cl-radius-sm)] bg-[var(--cl-accent-alpha-20)] text-[var(--cl-accent-strong)] [&_svg]:h-[11px] [&_svg]:w-[11px]">
                  <DeviceLockIcon />
                </div>
                <div>Works with <strong className="text-[var(--cl-surface-paper)]">Google Authenticator</strong>, Authy, 1Password, and others.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-w-0 flex-1 flex-col justify-center bg-[var(--cl-surface-paper-2)] px-8 py-9 max-[780px]:px-6 max-[780px]:py-7">
          <Button type="button" variant="ghost" className="mfa-app-back inline-flex self-start gap-1.5 rounded px-0 py-0 text-[var(--cl-text-sm)] font-bold text-[var(--cl-surface-muted-8)] shadow-none hover:text-[var(--cl-surface-ink-3)] focus-visible:outline-[var(--cl-accent-strong)] [&_svg]:h-[13px] [&_svg]:w-[13px]" onClick={onBack} aria-label="Back to sign in">
            <BackIcon />
            Back
          </Button>

          <div className="mb-6 mt-6 inline-flex self-start rounded-full bg-[var(--cl-surface-ink-3)] px-2 py-[7px] pr-3" role="status" aria-label={`Signing in as ${maskEmail(email)}`}>
            <div className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--cl-white-10)] text-[var(--cl-surface-warm)] [&_svg]:h-[10px] [&_svg]:w-[10px]" aria-hidden="true">
              <DeviceLockIcon />
            </div>
            <p className="text-[var(--cl-text-xs)] font-bold leading-[1.45] text-[var(--cl-white-85)]">
              Signing in as <strong className="text-[var(--cl-surface-warm)]">{maskEmail(email)}</strong>
            </p>
          </div>

          <h2 className="mb-1 text-[var(--cl-title-md)] font-black text-[var(--cl-surface-ink-3)]">Enter your code</h2>
          <p className="mb-[26px] text-[var(--cl-text-md)] leading-[1.65] text-[var(--cl-muted)]">Open your authenticator app and enter the 6-digit code shown for Clausule.</p>

          <div className="mb-2 self-center text-left text-[var(--cl-text-2xs)] font-bold uppercase tracking-[0.04em] text-[var(--cl-surface-muted-8)] max-[480px]:w-full max-[480px]:max-w-[282px]">6-digit code</div>

          <DigitRow
            digits={otp}
            inputState={otpState}
            inputRefs={otpRefs}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
          />

          {(otpState === 'error' || errorMessage) && (
            <p className="mfa-error" role="alert">{errorMessage || 'Incorrect code — try again'}</p>
          )}

          <Button
            type="button"
            variant="primary"
            className="mfa-app-btn mt-1 min-h-[50px] rounded-xl text-[var(--cl-text-base)] font-bold shadow-none focus-visible:outline-[var(--cl-accent-strong)]"
            onClick={onVerify}
            disabled={!codeReady || otpState === 'checking' || otpState === 'done'}
            aria-label="Verify authentication code"
          >
            <CheckIcon />
            Verify identity
          </Button>

          {onUseRecovery && (
            <p className="mt-5 text-[var(--cl-text-sm)] leading-[1.6] text-[var(--cl-surface-muted-8)]">
              Can't access your app?{' '}
              <Button type="button" variant="ghost" className="mfa-app-link inline-flex px-0 py-0 text-[var(--cl-accent-deep)] shadow-none hover:text-[var(--cl-accent-deeper)]" onClick={onUseRecovery}>Use a recovery code</Button>
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--cl-surface-muted-8)]" aria-hidden="true">
            <span className="inline-flex items-center gap-1.5">
              <DeviceLockIcon />
              End-to-end encrypted
            </span>
            <i className="h-1 w-1 rounded-full bg-[var(--cl-surface-muted-8)]" />
            <span className="inline-flex items-center gap-1.5">
              <DeviceLockIcon />
              30-second window
            </span>
            <i className="h-1 w-1 rounded-full bg-[var(--cl-surface-muted-8)]" />
            <span className="inline-flex items-center gap-1.5">
              <CheckIcon />
              TOTP standard
            </span>
          </div>
        </section>
      </div>
    </main>
  )
}
