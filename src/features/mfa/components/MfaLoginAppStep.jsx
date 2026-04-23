import DigitRow from './DigitRow'
import { maskEmail } from '@features/mfa/utils/maskEmail'
import { cn } from '@shared/utils/cn'
import { mfaUi } from './mfaClasses'

export default function MfaLoginAppStep({
  email,
  otp,
  otpRefs,
  otpState,
  onBack,
  onChange,
  onKeyDown,
  onPaste,
  onVerify,
  onUseRecovery,
}) {
  const codeReady = otp.every(Boolean)

  return (
    <main className={mfaUi.appShell}>
      <div className={mfaUi.appLeft}>
        <section>
          <div className={mfaUi.logo} aria-label="Clausule">
            <div className={mfaUi.logoBug} aria-hidden="true">
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M3 5h12M3 9h8M3 13h5" />
              </svg>
            </div>
            <div className={mfaUi.logoNameLight}>clausule</div>
          </div>

          <div className={mfaUi.leftBody}>
            <h1 className={mfaUi.leftHeadline}>Authenticator<br /><em>verification</em></h1>
            <p className={mfaUi.leftCopy}>Your app generates a fresh 6-digit code every 30 seconds.</p>
            <div className="grid gap-4" aria-hidden="true">
              <div className="flex gap-3 rounded-clausule bg-white/5 p-4 text-[13px] leading-[1.65] text-[#D8CEC1]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="8" cy="8" r="6" />
                    <path d="M8 5v3.5l2 1.5" />
                  </svg>
                </div>
                <div><strong>Refreshes every 30s</strong> — enter the current code shown in your app.</div>
              </div>
              <div className="flex gap-3 rounded-clausule bg-white/5 p-4 text-[13px] leading-[1.65] text-[#D8CEC1]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="3" y="7" width="10" height="8" rx="1.5" />
                    <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                  </svg>
                </div>
                <div>Works with <strong>Google Authenticator</strong>, Authy, 1Password, and others.</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className={mfaUi.appRight}>
          <button className={mfaUi.buttonGhost} onClick={onBack} aria-label="Back to sign in">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <polyline points="10 4 6 8 10 12" />
            </svg>
            Back
          </button>

          <div className={mfaUi.securityRow} role="status" aria-label={`Signing in as ${maskEmail(email)}`}>
            <div className={mfaUi.securityIcon} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="7" width="10" height="8" rx="1.5" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <p className="text-[13px] leading-[1.6] text-tm">
              Signing in as <strong>{maskEmail(email)}</strong>
            </p>
          </div>

          <h2 className={mfaUi.title}>Enter your code</h2>
          <p className={mfaUi.body}>Open your authenticator app and enter the 6-digit code shown for Clausule.</p>

          <div className="mt-5 text-label font-bold uppercase text-tm">6-digit code</div>

          <DigitRow
            digits={otp}
            inputState={otpState}
            inputRefs={otpRefs}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
          />

          {otpState === 'error' && (
            <p className={mfaUi.error} role="alert">Incorrect code — try again</p>
          )}

          <button
            className={`${mfaUi.buttonPrimary} mt-5 w-full`}
            onClick={onVerify}
            disabled={!codeReady || otpState === 'checking' || otpState === 'done'}
            aria-label="Verify authentication code"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="3 8 7 12 13 4" />
            </svg>
            Verify identity
          </button>

          {onUseRecovery && (
            <p className="mt-4 text-helper text-tm">
              Can't access your app?{' '}
              <button className={mfaUi.resendBtn} onClick={onUseRecovery}>Use a recovery code</button>
            </p>
          )}

          <div className={mfaUi.trustStrip} aria-hidden="true">
            <span className={mfaUi.trustItem}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="7" width="10" height="8" rx="1.5" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" />
              </svg>
              End-to-end encrypted
            </span>
            <i className={mfaUi.dividerDot} />
            <span className={mfaUi.trustItem}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3.5l2 1.5" />
              </svg>
              30-second window
            </span>
            <i className={mfaUi.dividerDot} />
            <span className={mfaUi.trustItem}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 2l1.8 3.6L14 6.4l-3 2.9.7 4.1L8 11.5l-3.7 1.9.7-4.1-3-2.9 4.2-.8z" />
              </svg>
              TOTP standard
            </span>
          </div>
      </section>
    </main>
  )
}
