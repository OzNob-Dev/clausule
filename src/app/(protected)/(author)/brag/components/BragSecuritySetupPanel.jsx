'use client'

import { Button } from '@shared/components/ui/Button'
import { useTotpSetup } from '@mfa/hooks/useTotpSetup'
import DigitRow from '@mfa/components/DigitRow'
import TotpSecretBlock from '@mfa/components/TotpSecretBlock'

export default function BragSecuritySetupPanel({ onDone, onCancel }) {
  const totpSetup = useTotpSetup({ onVerified: onDone, onVerifiedDelayMs: 600 })

  return (
    <div id="totp-setup" className="bss-totp-panel" aria-label="Authenticator app setup">
      <p className="bss-totp-desc">
        Scan the QR code with your authenticator app, or copy the key for manual entry. Then enter the 6-digit code to verify.
      </p>

      {totpSetup.loading ? (
        <div className="bss-totp-loading" aria-busy="true" aria-label="Generating authenticator setup">
          <span className="bss-spinner" aria-hidden="true" />
          Generating authenticator setup...
        </div>
      ) : totpSetup.loadError ? (
        <div className="bss-totp-error" role="alert">
          <p className="bss-totp-error-title">We couldn&apos;t generate your authenticator setup right now.</p>
          <Button type="button" variant="ghost" className="bss-totp-retry" onClick={() => totpSetup.retry()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <TotpSecretBlock
            copied={totpSetup.copied}
            copyClassName="bss-copy-btn"
            qrClassName="bss-qr-wrap"
            contentClassName="bss-totp-content"
            layoutClassName="bss-totp-layout"
            qrSize={140}
            secret={totpSetup.secretDisplay}
            secretAriaLabel="Manual entry key"
            secretClassName="bss-secret-key"
            secretRowClassName="bss-secret-row"
            uri={totpSetup.uri}
            onCopy={totpSetup.copySecret}
          >
            <div className="bss-otp-block">
              <label className="bss-otp-label">Enter 6-digit code to verify</label>
              <DigitRow
                ariaLabel="One-time password input"
                digits={totpSetup.totpCode.digits}
                inputRefs={totpSetup.inputRefs}
                inputState={totpSetup.totpCode.state}
                variant="bss"
                onChange={totpSetup.totpCode.handleChange}
                onKeyDown={totpSetup.totpCode.handleKeyDown}
                onPaste={totpSetup.totpCode.handlePaste}
              />
            </div>

            <div className="bss-totp-actions">
              <Button type="button" variant="ghost" className="bss-totp-cancel" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="button" className="bss-totp-verify" onClick={() => totpSetup.submitCode()}>
                Verify and enable
              </Button>
            </div>
          </TotpSecretBlock>
        </>
      )}
    </div>
  )
}
