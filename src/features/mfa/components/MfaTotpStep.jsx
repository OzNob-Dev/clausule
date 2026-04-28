import { Button } from '@shared/components/ui/Button'
import DigitRow from './DigitRow'
import TotpSecretBlock from './TotpSecretBlock'

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
                <TotpSecretBlock
                  copied={copied}
                  copyClassName="mfa-copy-btn"
                  qrClassName="mfa-qr-wrap"
                  qrSize={148}
                  secret={totpSecretDisp}
                  secretClassName="mfa-secret"
                  secretRowClassName="mfa-secret-row"
                  uri={totpUri}
                  onCopy={onCopySecret}
                />
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
          <Button className="mfa-enter-btn" onClick={onContinue}>
            Continue
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  )
}
