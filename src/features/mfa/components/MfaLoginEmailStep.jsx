import DigitRow from './DigitRow'
import { maskEmail } from '@features/mfa/utils/maskEmail'
import { cn } from '@shared/utils/cn'
import { mfaUi } from './mfaClasses'

export default function MfaLoginEmailStep({
  email,
  otp,
  otpRefs,
  otpState,
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

  return (
    <main className={mfaUi.appShell}>
      <div className={mfaUi.appLeft}>
        <section aria-label="Sign-in progress">
          <div className={mfaUi.logo}>
            <div className={mfaUi.logoBug} aria-hidden="true">
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M3 5h12M3 9h8M3 13h5" />
              </svg>
            </div>
            <div className={mfaUi.logoNameLight}>clausule</div>
          </div>

          <div className={mfaUi.leftBody}>
            <h1 className={mfaUi.leftHeadline}>Check your<br /><em>inbox</em></h1>
            <p className={mfaUi.leftCopy}>A one-time code was sent to your email. Enter it to continue signing in.</p>
            <div className={mfaUi.steps}>
              <div className={mfaUi.stepRow}>
                <span className={cn(mfaUi.stepNum, mfaUi.stepNumDone)} aria-hidden="true">✓</span>
                <span>Email entered</span>
              </div>
              <div className={mfaUi.stepRow}>
                <span className={cn(mfaUi.stepNum, mfaUi.stepNumActive)} aria-hidden="true">2</span>
                <span aria-current="step">Verify code</span>
              </div>
              <div className={mfaUi.stepRow}>
                <span className={mfaUi.stepNum} aria-hidden="true">3</span>
                <span>Access granted</span>
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

          <h2 className={mfaUi.title}>Verify your code</h2>
          <p className={mfaUi.body}>
            Enter the 6-digit code we sent to <strong>{maskEmail(email)}</strong>. It expires in 10 minutes.
          </p>

          <div className={mfaUi.preview} role="img" aria-label="Example of the email you received">
            <div className={mfaUi.previewHead}>
              <div className={mfaUi.previewIcon} aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="12" height="9" rx="1.5" />
                  <polyline points="2 4 8 9 14 4" />
                </svg>
              </div>
              <div className={mfaUi.previewMeta}>
                <div className={mfaUi.previewFrom}>noreply@clausule.com</div>
                <div className={mfaUi.previewSubject}>Your Clausule sign-in code</div>
              </div>
              <div className={mfaUi.previewTime}>Just now</div>
            </div>
            <div className="mt-4 text-[14px] leading-[1.7] text-tm">
              <p>Hi there, here's your one-time sign-in code for Clausule.</p>
              <div className={mfaUi.codeBlock} aria-label="6-digit code placeholder">
                <span className={mfaUi.codeDigit} aria-hidden="true">*</span>
                <span className={mfaUi.codeDigit} aria-hidden="true">*</span>
                <span className={mfaUi.codeDigit} aria-hidden="true">*</span>
                <span className={mfaUi.codeSeparator} aria-hidden="true" />
                <span className={mfaUi.codeDigit} aria-hidden="true">*</span>
                <span className={mfaUi.codeDigit} aria-hidden="true">*</span>
                <span className={mfaUi.codeDigit} aria-hidden="true">*</span>
              </div>
              <div className="mt-3 text-helper text-tm">Valid for <strong>10 minutes</strong>. Never share this code.</div>
            </div>
          </div>

          <div className={mfaUi.metaRow}>
            <span id="mfa-email-otp-label">Enter code</span>
            {expirySeconds > 0 ? (
              <span>Expires in <strong aria-live="polite">{mins}:{secs}</strong></span>
            ) : (
              <strong className={mfaUi.expired}>Code expired</strong>
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

          {otpState === 'error' && (
            <p className={mfaUi.error} role="alert">Incorrect code — try again</p>
          )}

          <button
            className={`${mfaUi.buttonPrimary} mt-5 w-full`}
            onClick={onVerify}
            disabled={!codeReady || otpState === 'checking' || otpState === 'done' || expirySeconds <= 0}
            aria-label="Verify your code"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="3 8 7 12 13 4" />
            </svg>
            Verify code
          </button>

          <div className={mfaUi.footer}>
            <p>
              Didn't get it?{' '}
              {resendTimer > 0 ? (
                <span>Resend in {resendTimer}s</span>
              ) : (
                <button className={mfaUi.resendBtn} onClick={onResend}>Resend code</button>
              )}
            </p>
            {onSetupApp && (
              <p>
                Want more security?{' '}
                <button className={mfaUi.resendBtn} onClick={onSetupApp}>Set up an authenticator app</button>
              </p>
            )}
          </div>
      </section>
    </main>
  )
}
