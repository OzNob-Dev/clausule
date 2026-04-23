import TotpSetupPanel from '@features/brag/components/TotpSetupPanel'
import { cn } from '@shared/utils/cn'
import { bragSettingsUi } from './bragClasses'

export default function MfaSecuritySection({
  authenticatorAppConfigured,
  hasSecuritySnapshot,
  mfaRestrictionEnabled,
  totpExpanded,
  onTotpDone,
  onToggleTotp,
}) {
  return (
    <>
      <div className={bragSettingsUi.sectionLabel}>Two-factor authentication</div>
      <div className={bragSettingsUi.card}>
        <div className={bragSettingsUi.mfaRow}>
          <div className={cn(bragSettingsUi.mfaIcon, bragSettingsUi.mfaIconOn)} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="6" width="18" height="13" rx="2"/>
              <path d="M3 10l9 6 9-6"/>
            </svg>
          </div>
          <div className={bragSettingsUi.mfaInfo}>
            <div className={bragSettingsUi.mfaTitle}>Email code</div>
            <div className={bragSettingsUi.mfaSub}>A one-time code sent to your email address each time you sign in.</div>
          </div>
          <span className={bragSettingsUi.statusOn} aria-label="Email code is active">Active</span>
        </div>

        <div className={bragSettingsUi.mfaDivider} />

        <div className={bragSettingsUi.mfaRow}>
          <div className={cn(bragSettingsUi.mfaIcon, (authenticatorAppConfigured || hasSecuritySnapshot) && bragSettingsUi.mfaIconOn)} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="2" width="14" height="20" rx="2"/>
              <rect x="8" y="7" width="8" height="6" rx="1"/>
              <circle cx="12" cy="17.5" r="1"/>
            </svg>
          </div>

          <div className={bragSettingsUi.mfaInfo}>
            <div className={bragSettingsUi.mfaTitle}>Authenticator app</div>
            <div className={bragSettingsUi.mfaSub}>
              {authenticatorAppConfigured
                ? 'Authenticator app verification is active for this account.'
                : 'Required — set up an authenticator app to unlock the rest of Clausule.'}
            </div>
          </div>
          {authenticatorAppConfigured ? (
            <span className={bragSettingsUi.statusOn} aria-label="Authenticator app is active">Active</span>
          ) : hasSecuritySnapshot && (
            <button
              className={bragSettingsUi.reconfigBtn}
              onClick={onToggleTotp}
              aria-expanded={totpExpanded}
              aria-controls="totp-setup"
            >
              {totpExpanded ? 'Cancel' : 'Set up'}
            </button>
          )}
        </div>

        {!hasSecuritySnapshot && (
          <div className={bragSettingsUi.loadingState} aria-busy="true">
            <span className={bragSettingsUi.loadingDot} aria-hidden="true" />
            Loading authenticator status…
          </div>
        )}

        {hasSecuritySnapshot && !authenticatorAppConfigured && !totpExpanded && (
          <div className={cn(bragSettingsUi.totpEmpty, mfaRestrictionEnabled && bragSettingsUi.totpEmptyRequired)} role="status" aria-live="polite">
            <div className={bragSettingsUi.totpTitle}>Authenticator setup required</div>
            <p className={bragSettingsUi.totpCopy}>
              This keeps your account protected. Set it up now to continue using the app.
            </p>
          </div>
        )}

        {!authenticatorAppConfigured && totpExpanded && hasSecuritySnapshot && (
          <TotpSetupPanel onDone={onTotpDone} onCancel={onToggleTotp} />
        )}
      </div>
    </>
  )
}
