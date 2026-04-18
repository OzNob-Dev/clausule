import DigitRow from './DigitRow'

export default function MfaLoginAppStep({
  email,
  otp,
  otpRefs,
  otpState,
  onChange,
  onKeyDown,
  onPaste,
  onVerify,
  onUseRecovery,
}) {
  return (
    <div className="mfa-pane mfa-login-pane" key="login-app">
      <div className="mfa-sec-row mfa-sec-row--accent">
        <div className="mfa-sec-icon mfa-sec-icon--accent">
          <svg viewBox="0 0 16 16" fill="none" stroke="#D05A34" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <rect x="3" y="7" width="10" height="8" rx="1.5" />
            <path d="M5 7V5a3 3 0 0 1 6 0v2" />
            <circle cx="8" cy="11" r="1" fill="#D05A34" stroke="none" />
          </svg>
        </div>
        <p className="mfa-sec-text">
          Signing in as <strong>{email}</strong>
        </p>
      </div>

      <h1 className="mfa-heading mfa-login-heading">Enter your code</h1>
      <p className="mfa-sub">Open your authenticator app and enter the 6-digit code for Clausule.</p>

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
        className="mfa-enter-btn mfa-login-btn"
        onClick={onVerify}
        disabled={otpState === 'checking' || otpState === 'done'}
      >
        Verify
      </button>

      {onUseRecovery && (
        <p className="mfa-resend">
          Can't access your app?{' '}
          <button className="mfa-resend-btn" onClick={onUseRecovery}>Use a recovery code</button>
        </p>
      )}
    </div>
  )
}
