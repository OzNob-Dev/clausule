import './MfaLoginAppStep.css'
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
    <main className="mfa-app-wrap">
      <div className="mfa-app-shell">
        <section className="mfa-app-left">
          <div className="mfa-app-logo" aria-label="Clausule">
            <div className="mfa-app-logo-bug" aria-hidden="true">
              <BrandMarkIcon />
            </div>
            <div className="mfa-app-logo-name">clausule</div>
          </div>

          <div className="mfa-app-left-body">
            <h1>Authenticator<br /><em>verification</em></h1>
            <p>Your app generates a fresh 6-digit code every 30 seconds.</p>
            <div className="mfa-app-totp-strip" aria-hidden="true">
              <div className="mfa-app-totp-item">
              <div className="mfa-app-totp-icon">
                  <DeviceLockIcon />
                </div>
                <div><strong>Refreshes every 30s</strong> — enter the current code shown in your app.</div>
              </div>
              <div className="mfa-app-totp-item">
              <div className="mfa-app-totp-icon">
                  <DeviceLockIcon />
                </div>
                <div>Works with <strong>Google Authenticator</strong>, Authy, 1Password, and others.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mfa-app-right">
          <Button type="button" variant="ghost" className="mfa-app-back" onClick={onBack} aria-label="Back to sign in">
            <BackIcon />
            Back
          </Button>

          <div className="mfa-app-sec-row" role="status" aria-label={`Signing in as ${maskEmail(email)}`}>
            <div className="mfa-app-sec-icon" aria-hidden="true">
              <DeviceLockIcon />
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

          {(otpState === 'error' || errorMessage) && (
            <p className="mfa-error" role="alert">{errorMessage || 'Incorrect code — try again'}</p>
          )}

          <Button
            type="button"
            variant="primary"
            className="mfa-app-btn"
            onClick={onVerify}
            disabled={!codeReady || otpState === 'checking' || otpState === 'done'}
            aria-label="Verify authentication code"
          >
            <CheckIcon />
            Verify identity
          </Button>

          {onUseRecovery && (
            <p className="mfa-app-footer">
              Can't access your app?{' '}
              <Button type="button" variant="ghost" className="mfa-app-link" onClick={onUseRecovery}>Use a recovery code</Button>
            </p>
          )}

          <div className="mfa-app-trust-strip" aria-hidden="true">
            <span>
              <DeviceLockIcon />
              End-to-end encrypted
            </span>
            <i />
            <span>
              <DeviceLockIcon />
              30-second window
            </span>
            <i />
            <span>
              <CheckIcon />
              TOTP standard
            </span>
          </div>
        </section>
      </div>
    </main>
  )
}
