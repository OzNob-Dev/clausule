'use client'

import { Button } from '@shared/components/ui/Button'
import { useTotpSetup } from '@mfa/hooks/useTotpSetup'
import DigitRow from '@shared/components/DigitRow'
import TotpSecretBlock from '@shared/components/TotpSecretBlock'

export default function BragSecuritySetupPanel({ onDone, onCancel }) {
  const totpSetup = useTotpSetup({ onVerified: onDone, onVerifiedDelayMs: 600 })

  return (
    <div id="totp-setup" className="bss-totp-panel rounded-b-[16px] border-t border-[var(--cl-border-2)] bg-[var(--cl-surface-paper)] px-8 py-7 max-[860px]:px-6" aria-label="Authenticator app setup">
      <p className="bss-totp-desc mb-5 max-w-[64ch] text-[var(--cl-text-base)] leading-[1.6] text-[var(--cl-surface-muted-9)]">
        Scan the QR code with your authenticator app, or copy the key for manual entry. Then enter the 6-digit code to verify.
      </p>

      {totpSetup.loading ? (
        <div className="bss-totp-loading flex items-center gap-3 rounded-xl border border-[var(--cl-border-2)] bg-[var(--cl-rule-2)] px-4 py-4 text-[var(--cl-text-base)] font-semibold text-[var(--cl-surface-muted-8)]" aria-busy="true" aria-label="Generating authenticator setup">
          <span className="bss-spinner h-4 w-4 animate-spin rounded-full border-2 border-[var(--cl-accent-soft-12)] border-t-[var(--cl-accent-deep)]" aria-hidden="true" />
          Generating authenticator setup...
        </div>
      ) : totpSetup.loadError ? (
        <div className="bss-totp-error rounded-xl border border-[var(--cl-danger-alpha-18)] bg-[var(--cl-danger-soft)] px-4 py-4" role="alert">
          <p className="bss-totp-error-title mb-3 text-[var(--cl-text-base)] font-bold text-[var(--cl-danger-5)]">We couldn&apos;t generate your authenticator setup right now.</p>
          <Button type="button" variant="ghost" className="bss-totp-retry inline-flex rounded-lg border border-[var(--cl-danger-5)] px-4 py-2 text-[var(--cl-text-sm)] font-bold text-[var(--cl-danger-5)] shadow-none hover:bg-[var(--cl-danger-alpha-18)]" onClick={() => totpSetup.retry()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <TotpSecretBlock
            copied={totpSetup.copied}
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
              <label className="bss-otp-label mb-2 block text-[var(--cl-text-xs)] font-bold uppercase tracking-[0.12em] text-[var(--cl-surface-muted-8)]">Enter 6-digit code to verify</label>
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

            <div className="bss-totp-actions mt-6 flex flex-wrap items-center justify-end gap-3">
              <Button type="button" variant="ghost" className="bss-totp-cancel rounded-lg border border-[var(--cl-border-2)] px-4 py-2.5 text-[var(--cl-text-sm)] font-bold shadow-none hover:bg-[var(--cl-rule-2)]" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="button" variant="primary" className="bss-totp-verify rounded-lg px-4 py-2.5 text-[var(--cl-text-sm)] font-bold shadow-none" onClick={() => totpSetup.submitCode()}>
                Verify and enable
              </Button>
            </div>
          </TotpSecretBlock>
        </>
      )}
    </div>
  )
}
