import { useTotpSetup } from '@features/mfa/hooks/useTotpSetup'
import DigitRow from '@features/mfa/components/DigitRow'
import TotpSecretBlock from '@features/mfa/components/TotpSecretBlock'

export default function TotpSetupPanel({ onDone, onCancel }) {
  const totpSetup = useTotpSetup({ onVerified: onDone, onVerifiedDelayMs: 600 })

  return (
    <div id="totp-setup" className="bss-totp-body">
      <p className="bss-totp-instruction">
        Scan the QR code with your authenticator app, or copy the key for manual entry.
        Then enter the 6-digit code to verify.
      </p>

      {totpSetup.loading ? (
        <div className="bss-loading" aria-busy="true" aria-label="Generating secret">
          <span className="bss-spinner" aria-hidden="true" />
        </div>
      ) : totpSetup.loadError ? (
        <div className="bss-error" role="alert">
          We couldn&apos;t generate your authenticator setup right now.
          <div className="bss-totp-actions">
            <button type="button" className="bss-mfa-reconfig-btn" onClick={() => totpSetup.retry()}>Try again</button>
          </div>
        </div>
      ) : (
        <>
          <TotpSecretBlock
            copied={totpSetup.copied}
            copyClassName="bss-copy-btn"
            qrClassName="bss-qr-wrap"
            qrSize={136}
            secret={totpSetup.secretDisplay}
            secretClassName="bss-secret-code"
            secretRowClassName="bss-secret-row"
            uri={totpSetup.uri}
            onCopy={totpSetup.copySecret}
          />
          <DigitRow
            ariaLabel="6-digit verification code"
            digits={totpSetup.totpCode.digits}
            inputRefs={totpSetup.inputRefs}
            inputState={totpSetup.totpCode.state}
            variant="bss"
            onChange={totpSetup.totpCode.handleChange}
            onKeyDown={totpSetup.totpCode.handleKeyDown}
            onPaste={totpSetup.totpCode.handlePaste}
          />
          {totpSetup.totpCode.state === 'error' && (
            <p className="bss-otp-error" role="alert">Incorrect code — try again</p>
          )}
        </>
      )}

      <div className="bss-totp-actions">
        <button type="button" className="bss-totp-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
