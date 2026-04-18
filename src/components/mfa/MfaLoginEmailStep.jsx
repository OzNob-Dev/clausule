import DigitRow from './DigitRow'

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
  onSetupApp,
}) {
  const totalSeconds = 600
  const pct = Math.max(0, (expirySeconds / totalSeconds) * 100)
  const mins = Math.floor(expirySeconds / 60)
  const secs = String(expirySeconds % 60).padStart(2, '0')

  return (
    <div className="mfa-pane mfa-login-pane" key="login-email">
      <div className="mfa-sec-row">
        <div className="mfa-sec-icon">
          <svg viewBox="0 0 16 16" fill="none" stroke="#5B4E42" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="4" width="12" height="9" rx="1.5" />
            <polyline points="2 4 8 9 14 4" />
          </svg>
        </div>
        <p className="mfa-sec-text">
          We sent a code to <strong>{email}</strong>
        </p>
      </div>

      <h1 className="mfa-heading mfa-login-heading">Check your email</h1>
      <p className="mfa-sub">Enter the 6-digit code we just sent. It expires in 10 minutes.</p>

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

      <div className="mfa-expiry-note">
        {expirySeconds > 0
          ? <>Expires in <span aria-live="polite">{mins}:{secs}</span></>
          : <span className="mfa-expiry-expired">Code expired</span>
        }
        <div className="mfa-expiry-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Code expiry">
          <div className="mfa-expiry-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <button
        className="mfa-enter-btn mfa-login-btn"
        onClick={onVerify}
        disabled={otpState === 'checking' || otpState === 'done' || expirySeconds <= 0}
      >
        Verify
      </button>

      <div className="mfa-login-footer">
        <p className="mfa-resend">
          Didn't get it?{' '}
          {resendTimer > 0 ? (
            <span>Resend in {resendTimer}s</span>
          ) : (
            <button className="mfa-resend-btn" onClick={onResend}>Resend code</button>
          )}
        </p>
        {onSetupApp && (
          <p className="mfa-resend">
            Want more security?{' '}
            <button className="mfa-resend-btn" onClick={onSetupApp}>Set up an authenticator app</button>
          </p>
        )}
      </div>
    </div>
  )
}
