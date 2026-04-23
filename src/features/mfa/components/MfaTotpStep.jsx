import DigitRow from './DigitRow'
import TotpSecretBlock from './TotpSecretBlock'
import { cn } from '@shared/utils/cn'
import { mfaUi } from './mfaClasses'

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
    <div className={mfaUi.pane} key="factors">
      <h1 className={mfaUi.heading}>Secure your account</h1>
      <p className={mfaUi.sub}>Set up an authenticator app to protect your account.</p>

      <div className={cn(mfaUi.factorCard, totpDone && mfaUi.factorCardDone)}>
        <div className={mfaUi.factorHead}>
          <div className={cn(mfaUi.factorBadge, totpDone && mfaUi.factorBadgeDone)}>
            {totpDone ? (
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M2 6l3 3 5-5" />
              </svg>
            ) : (
              '1'
            )}
          </div>
          <div>
            <div className={mfaUi.factorTitle}>Authenticator app</div>
            <div className={mfaUi.factorSub}>
              {totpDone ? 'Verified and active' : 'Google Authenticator, Authy, 1Password, etc.'}
            </div>
          </div>
        </div>

        {!totpDone && (
          <div className={mfaUi.factorBody}>
            {totpLoading ? (
              <p className={mfaUi.factorInstruction}>Generating secret…</p>
            ) : (
              <>
                <p className={mfaUi.factorInstruction}>
                  Scan with your authenticator app, or copy the key below for manual entry.
                </p>
                <TotpSecretBlock
                  copied={copied}
                  copyClassName={mfaUi.copyBtn}
                  qrClassName={mfaUi.qrWrap}
                  qrSize={148}
                  secret={totpSecretDisp}
                  secretClassName={mfaUi.secret}
                  secretRowClassName={mfaUi.secretRow}
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
                {totpState === 'error' && <p className={mfaUi.error} role="alert">Incorrect code — try again</p>}
              </>
            )}
          </div>
        )}
      </div>

      {totpDone && (
        <div className={mfaUi.factorActions}>
          <button className={mfaUi.buttonPrimary} onClick={onContinue}>
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
