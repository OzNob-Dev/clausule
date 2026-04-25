import dynamic from 'next/dynamic'

const TotpSetupPanel = dynamic(() => import('@features/brag/components/TotpSetupPanel'), {
  loading: () => <div className="bss-loading-state" aria-busy="true">Loading authenticator setup…</div>,
})

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
      <div className="bss-section-label">Two-factor authentication</div>
      <div className="bss-card">
        <div className="bss-mfa-row">
          <div className="bss-mfa-icon bss-mfa-icon--on" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="6" width="18" height="13" rx="2"/>
              <path d="M3 10l9 6 9-6"/>
            </svg>
          </div>
          <div className="bss-mfa-info">
            <div className="bss-mfa-title">Email code</div>
            <div className="bss-mfa-sub">A one-time code sent to your email address each time you sign in.</div>
          </div>
          <span className="bss-mfa-status bss-mfa-status--on" aria-label="Email code is active">Active</span>
        </div>

        <div className="bss-mfa-divider" />

        <div className="bss-mfa-row">
          <div className={`bss-mfa-icon${authenticatorAppConfigured || hasSecuritySnapshot ? ' bss-mfa-icon--on' : ''}`} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="2" width="14" height="20" rx="2"/>
              <rect x="8" y="7" width="8" height="6" rx="1"/>
              <circle cx="12" cy="17.5" r="1"/>
            </svg>
          </div>

          <div className="bss-mfa-info">
            <div className="bss-mfa-title">Authenticator app</div>
            <div className="bss-mfa-sub">
              {authenticatorAppConfigured
                ? 'Authenticator app verification is active for this account.'
                : 'Required — set up an authenticator app to unlock the rest of Clausule.'}
            </div>
          </div>
          {authenticatorAppConfigured ? (
            <span className="bss-mfa-status bss-mfa-status--on" aria-label="Authenticator app is active">Active</span>
          ) : hasSecuritySnapshot && (
            <button
              type="button"
              className="bss-mfa-reconfig-btn"
              onClick={onToggleTotp}
              aria-expanded={totpExpanded}
              aria-controls="totp-setup"
            >
              {totpExpanded ? 'Cancel' : 'Set up'}
            </button>
          )}
        </div>

        {!hasSecuritySnapshot && (
          <div className="bss-loading-state" aria-busy="true">
            <span className="bss-loading-state__dot" aria-hidden="true" />
            Loading authenticator status…
          </div>
        )}

        {hasSecuritySnapshot && !authenticatorAppConfigured && !totpExpanded && (
          <div className={`bss-totp-empty${mfaRestrictionEnabled ? ' bss-totp-empty--required' : ''}`} role="status" aria-live="polite">
            <div className="bss-totp-empty-title">Authenticator setup required</div>
            <p className="bss-totp-empty-copy">
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
