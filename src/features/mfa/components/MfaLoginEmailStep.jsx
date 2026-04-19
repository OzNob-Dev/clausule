import DigitRow from './DigitRow'

function maskEmail(email) {
  const [name = '', domain = ''] = String(email).split('@')
  if (!name || !domain) return '**'
  const visible = name.length <= 2 ? name[0] : name.slice(0, 2)
  return `${visible}***@${domain}`
}

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
    <main className="mfa-email-wrap">
      <div className="mfa-email-shell">
        <section className="mfa-email-left" aria-label="Sign-in progress">
          <div className="mfa-email-logo">
            <div className="mfa-email-logo-bug" aria-hidden="true">
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M3 5h12M3 9h8M3 13h5" />
              </svg>
            </div>
            <div className="mfa-email-logo-name">clausule</div>
          </div>

          <div className="mfa-email-left-body">
            <h1>Check your<br /><em>inbox</em></h1>
            <p>A one-time code was sent to your email. Enter it to continue signing in.</p>
            <div className="mfa-email-steps">
              <div className="mfa-email-step">
                <span className="mfa-email-step-num mfa-email-step-num--done" aria-hidden="true">✓</span>
                <span>Email entered</span>
              </div>
              <div className="mfa-email-step">
                <span className="mfa-email-step-num mfa-email-step-num--active" aria-hidden="true">2</span>
                <span className="mfa-email-step-current" aria-current="step">Verify code</span>
              </div>
              <div className="mfa-email-step">
                <span className="mfa-email-step-num" aria-hidden="true">3</span>
                <span>Access granted</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mfa-email-right">
          <button className="mfa-email-back" onClick={onBack} aria-label="Back to sign in">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <polyline points="10 4 6 8 10 12" />
            </svg>
            Back
          </button>

          <h2 className="mfa-email-title">Verify your code</h2>
          <p className="mfa-email-sub">
            Enter the 6-digit code we sent to <strong>{maskEmail(email)}</strong>. It expires in 10 minutes.
          </p>

          <div className="mfa-email-preview" role="img" aria-label="Example of the email you received">
            <div className="mfa-email-preview-head">
              <div className="mfa-email-preview-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="12" height="9" rx="1.5" />
                  <polyline points="2 4 8 9 14 4" />
                </svg>
              </div>
              <div className="mfa-email-preview-meta">
                <div className="mfa-email-preview-from">noreply@clausule.com</div>
                <div className="mfa-email-preview-subject">Your Clausule sign-in code</div>
              </div>
              <div className="mfa-email-preview-time">Just now</div>
            </div>
            <div className="mfa-email-preview-body">
              <p>Hi there, here's your one-time sign-in code for Clausule.</p>
              <div className="mfa-email-code-block" aria-label="6-digit code placeholder">
                <span className="mfa-email-code-digit" aria-hidden="true">*</span>
                <span className="mfa-email-code-digit" aria-hidden="true">*</span>
                <span className="mfa-email-code-digit" aria-hidden="true">*</span>
                <span className="mfa-email-code-separator" aria-hidden="true" />
                <span className="mfa-email-code-digit" aria-hidden="true">*</span>
                <span className="mfa-email-code-digit" aria-hidden="true">*</span>
                <span className="mfa-email-code-digit" aria-hidden="true">*</span>
              </div>
              <div className="mfa-email-note">Valid for <strong>10 minutes</strong>. Never share this code.</div>
            </div>
          </div>

          <div className="mfa-email-otp-meta">
            <span id="mfa-email-otp-label">Enter code</span>
            {expirySeconds > 0 ? (
              <span>Expires in <strong aria-live="polite">{mins}:{secs}</strong></span>
            ) : (
              <strong className="mfa-email-expired">Code expired</strong>
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
            <p className="mfa-error" role="alert">Incorrect code — try again</p>
          )}

          <button
            className="mfa-email-verify"
            onClick={onVerify}
            disabled={!codeReady || otpState === 'checking' || otpState === 'done' || expirySeconds <= 0}
            aria-label="Verify your code"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="3 8 7 12 13 4" />
            </svg>
            Verify code
          </button>

          <div className="mfa-email-footer">
            <p>
              Didn't get it?{' '}
              {resendTimer > 0 ? (
                <span>Resend in {resendTimer}s</span>
              ) : (
                <button className="mfa-email-resend" onClick={onResend}>Resend code</button>
              )}
            </p>
            {onSetupApp && (
              <p>
                Want more security?{' '}
                <button className="mfa-email-resend" onClick={onSetupApp}>Set up an authenticator app</button>
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
