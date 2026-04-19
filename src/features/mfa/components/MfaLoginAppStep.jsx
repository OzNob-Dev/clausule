import DigitRow from './DigitRow'

function maskEmail(email) {
  const [name = '', domain = ''] = String(email).split('@')
  if (!name || !domain) return '**'
  const visible = name.length <= 2 ? name[0] : name.slice(0, 2)
  return `${visible}***@${domain}`
}

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
    <main className="mfa-app-wrap">
      <div className="mfa-app-shell">
        <section className="mfa-app-left">
          <div className="mfa-app-logo" aria-label="Clausule">
            <div className="mfa-app-logo-bug" aria-hidden="true">
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M3 5h12M3 9h8M3 13h5" />
              </svg>
            </div>
            <div className="mfa-app-logo-name">clausule</div>
          </div>

          <div className="mfa-app-left-body">
            <h1>Authenticator<br /><em>verification</em></h1>
            <p>Your app generates a fresh 6-digit code every 30 seconds.</p>
            <div className="mfa-app-totp-strip" aria-hidden="true">
              <div className="mfa-app-totp-item">
                <div className="mfa-app-totp-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="8" cy="8" r="6" />
                    <path d="M8 5v3.5l2 1.5" />
                  </svg>
                </div>
                <div><strong>Refreshes every 30s</strong> — enter the current code shown in your app.</div>
              </div>
              <div className="mfa-app-totp-item">
                <div className="mfa-app-totp-icon">
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

        <section className="mfa-app-right">
          <button className="mfa-app-back" onClick={onBack} aria-label="Back to sign in">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <polyline points="10 4 6 8 10 12" />
            </svg>
            Back
          </button>

          <div className="mfa-app-sec-row" role="status" aria-label={`Signing in as ${maskEmail(email)}`}>
            <div className="mfa-app-sec-icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="7" width="10" height="8" rx="1.5" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <p className="mfa-app-sec-text">
              Signing in as <strong>{maskEmail(email)}</strong>
            </p>
          </div>

          <h2 className="mfa-app-title">Enter your code</h2>
          <p className="mfa-app-sub">Open your authenticator app and enter the 6-digit code shown for Clausule.</p>

          <div className="mfa-app-otp-label">6-digit code</div>

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
            disabled={!codeReady || otpState === 'checking' || otpState === 'done'}
            aria-label="Verify authentication code"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="3 8 7 12 13 4" />
            </svg>
            Verify identity
          </button>

          {onUseRecovery && (
            <p className="mfa-app-footer">
              Can't access your app?{' '}
              <button className="mfa-app-link" onClick={onUseRecovery}>Use a recovery code</button>
            </p>
          )}

          <div className="mfa-app-trust-strip" aria-hidden="true">
            <span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="7" width="10" height="8" rx="1.5" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" />
              </svg>
              End-to-end encrypted
            </span>
            <i />
            <span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3.5l2 1.5" />
              </svg>
              30-second window
            </span>
            <i />
            <span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 2l1.8 3.6L14 6.4l-3 2.9.7 4.1L8 11.5l-3.7 1.9.7-4.1-3-2.9 4.2-.8z" />
              </svg>
              TOTP standard
            </span>
          </div>
        </section>
      </div>
    </main>
  )
}
