import { Button } from '@shared/components/ui/Button'
import { ArrowIcon } from '@shared/components/ui/icon/ArrowIcon'
import { CheckIcon } from '@shared/components/ui/icon/CheckIcon'
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
    <div className="mfa-pane mfa-pane--factors flex animate-[mfa-in_0.28s_cubic-bezier(0.25,0.46,0.45,0.94)_both] flex-col items-stretch gap-0 text-left" key="factors">
      <h1 className="mfa-heading mb-2.5 self-center text-center text-[23px] font-black leading-[1.2] tracking-[-0.5px] text-[var(--cl-surface-ink)] max-[480px]:text-[var(--cl-title-sm)]">Secure your account</h1>
      <p className="mfa-sub mb-7 max-w-[320px] self-center text-center text-[var(--cl-text-base)] leading-[1.7] text-[var(--cl-surface-muted-3)]">Set up an authenticator app to protect your account.</p>

      <div className={`mfa-factor-card mb-2.5 rounded-[14px] border-[1.5px] bg-[var(--cl-surface-paper)] p-[18px] transition-[border-color,background,opacity,filter] duration-300 ${totpDone ? 'mfa-factor-card--done border-[var(--cl-success-soft-4)] bg-[var(--cl-success-soft)]' : 'border-[var(--cl-border-3)]'}`}>
        <div className="mfa-factor-head flex items-center gap-3">
          <div className={`mfa-factor-badge flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[var(--cl-text-sm)] font-extrabold text-[var(--cl-surface-paper)] transition-colors [&_svg]:h-3 [&_svg]:w-3 ${totpDone ? 'mfa-factor-badge--done bg-[var(--cl-success-2)]' : 'bg-[var(--acc)]'}`}>
            {totpDone ? (
              <CheckIcon />
            ) : (
              '1'
            )}
          </div>
          <div>
            <div className="mfa-factor-title text-[var(--cl-text-md)] font-bold leading-[1.2] text-[var(--cl-surface-ink)]">Authenticator app</div>
            <div className="mfa-factor-sub mt-0.5 text-[var(--cl-text-xs)] text-[var(--cl-surface-muted-6)]">
              {totpDone ? 'Verified and active' : 'Google Authenticator, Authy, 1Password, etc.'}
            </div>
          </div>
        </div>

        {!totpDone && (
          <div className="mfa-factor-body mt-4 border-t border-t-[var(--cl-border-dark-4)] pt-[14px]">
            {totpLoading ? (
              <p className="mfa-factor-instruction mb-[14px] text-[var(--cl-text-md)] leading-[1.65] text-[var(--cl-surface-muted-3)]">Generating secret…</p>
            ) : (
              <>
                <p className="mfa-factor-instruction mb-[14px] text-[var(--cl-text-md)] leading-[1.65] text-[var(--cl-surface-muted-3)]">
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
                {totpState === 'error' ? <p className="mfa-error mb-2.5 text-[var(--cl-text-sm)] font-semibold text-[var(--cl-danger-3)]" role="alert">Incorrect code — try again</p> : null}
              </>
            )}
          </div>
        )}
      </div>

      {totpDone && (
        <div className="mfa-factor-actions mt-1.5 flex animate-[mfa-in_0.25s_ease_both] flex-col items-center gap-2.5">
          <Button className="mfa-enter-btn" onClick={onContinue}>
            Continue
            <ArrowIcon />
          </Button>
        </div>
      )}
    </div>
  )
}
