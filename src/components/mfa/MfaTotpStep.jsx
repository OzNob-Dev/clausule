import { QRCodeSVG } from 'qrcode.react'
import DigitRow from './DigitRow'

export default function MfaTotpStep({
  copied,
  onCopySecret,
  onContinue,
  totp,
  totpDone,
  totpLoading,
  totpRefs,
  totpSecretDisp,
  totpState,
  totpUri,
  onChange,
  onKeyDown,
  onPaste,
}) {
  return (
    <div className="mfa-pane mfa-pane--factors" key="factors">
      <h1 className="mfa-heading">Secure your account</h1>
      <p className="mfa-sub">Set up an authenticator app to protect your account.</p>

      <div className={`mfa-factor-card${totpDone ? ' mfa-factor-card--done' : ''}`}>
        <div className="mfa-factor-head">
          <div className={`mfa-factor-badge${totpDone ? ' mfa-factor-badge--done' : ''}`}>
            {totpDone ? (
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M2 6l3 3 5-5" />
              </svg>
            ) : (
              '1'
            )}
          </div>
          <div>
            <div className="mfa-factor-title">Authenticator app</div>
            <div className="mfa-factor-sub">
              {totpDone ? 'Verified and active' : 'Google Authenticator, Authy, 1Password, etc.'}
            </div>
          </div>
        </div>

        {!totpDone && (
          <div className="mfa-factor-body">
            {totpLoading ? (
              <p className="mfa-factor-instruction">Generating secret…</p>
            ) : (
              <>
                <p className="mfa-factor-instruction">
                  Scan with your authenticator app, or copy the key below for manual entry.
                </p>
                {totpUri && (
                  <div className="mfa-qr-wrap" aria-label="QR code for authenticator app">
                    <QRCodeSVG value={totpUri} size={148} bgColor="#FAF7F3" fgColor="#2A221A" level="M" />
                  </div>
                )}
                <div className="mfa-secret-row">
                  <code className="mfa-secret">{totpSecretDisp}</code>
                  <button className="mfa-copy-btn" onClick={onCopySecret} aria-label="Copy secret key">
                    {copied ? (
                      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 7l3.5 3.5L12 3" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="4" y="4" width="8" height="8" rx="1" />
                        <path d="M2 10V3a1 1 0 0 1 1-1h7" />
                      </svg>
                    )}
                  </button>
                </div>
                <DigitRow
                  digits={totp}
                  inputState={totpState}
                  inputRefs={totpRefs}
                  onChange={onChange}
                  onKeyDown={onKeyDown}
                  onPaste={onPaste}
                />
                {totpState === 'error' && <p className="mfa-error" role="alert">Incorrect code — try again</p>}
              </>
            )}
          </div>
        )}
      </div>

      {totpDone && (
        <div className="mfa-factor-actions">
          <button className="mfa-enter-btn" onClick={onContinue}>
            Continue
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
