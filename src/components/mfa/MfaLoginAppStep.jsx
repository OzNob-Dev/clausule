import DigitRow from './DigitRow'

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
  return (
    <main className="mfa-app-wrap">
      <div className="mfa-app-shell">
        <div className="mfa-app-logo" aria-label="Clausule">
          <div className="mfa-app-logo-bug" aria-hidden="true">
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M3 5h12M3 9h8M3 13h5" />
            </svg>
          </div>
          <div className="mfa-app-logo-name">clausule</div>
        </div>

        <button className="mfa-app-back" onClick={onBack} aria-label="Back to sign in">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="10 4 6 8 10 12" />
          </svg>
          Back
        </button>

        <div className="mfa-app-sec-row">
          <div className="mfa-app-sec-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <rect x="3" y="7" width="10" height="8" rx="1.5" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" />
              <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <p className="mfa-app-sec-text">
            Signing in as <strong>{email}</strong>
          </p>
        </div>

        <h1 className="mfa-app-title">Enter your code</h1>
        <p className="mfa-app-sub">Open your authenticator app and enter the 6-digit code for Clausule.</p>

        <DigitRow
          digits={otp}
          inputState={otpState}
          inputRefs={otpRefs}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
        />

        {otpState === 'error' && (
          <p className="mfa-error" role="alert">Incorrect code — try again</p>
        )}

        <button
          className="mfa-app-btn"
          onClick={onVerify}
          disabled={otpState === 'checking' || otpState === 'done'}
        >
          Verify
        </button>

        {onUseRecovery && (
          <p className="mfa-app-footer">
            Can't access your app?{' '}
            <button className="mfa-app-link" onClick={onUseRecovery}>Use a recovery code</button>
          </p>
        )}
      </div>
    </main>
  )
}
