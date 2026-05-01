'use client'

import { Button } from '@shared/components/ui/Button'
import { SectionCard } from '@shared/components/ui/SectionCard'
import BragSecuritySetupPanel from '@shared/components/BragSecuritySetupPanel'
import { TimerIcon } from '@shared/components/ui/icon/TimerIcon'
import { MailIcon } from '@shared/components/ui/icon/MailIcon'
import { DeviceLockIcon } from '@shared/components/ui/icon/DeviceLockIcon'

function StatusPill({ label, ariaLabel }) {
  return (
    <span
      className="bss-badge inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--cl-green-alpha-20)] bg-[var(--cl-green-alpha-12)] px-4 py-2 text-[var(--cl-text-base)] font-bold text-[var(--cl-green-2)] max-[860px]:ml-auto"
      role="status"
      aria-label={ariaLabel}
    >
      <span className="bss-badge__dot h-1.5 w-1.5 rounded-full bg-[var(--cl-green-2)]" aria-hidden="true" />
      {label}
    </span>
  )
}

export default function BragSecurityMethodsCard({
  authenticatorAppConfigured,
  hasSecuritySnapshot,
  mfaRestrictionEnabled,
  totpExpanded,
  onTotpDone,
  onToggleTotp,
}) {
  return (
    <section className="bss-section" aria-labelledby="security-methods-title">
      <div className="bss-section-label text-[0.9375rem] leading-[1.4] text-[var(--cl-surface-ink-2)]" id="security-methods-title">Two-factor authentication</div>
      <SectionCard
        titleClassName="bss-card-head-title"
        metaClassName="bss-card-head-meta"
        title="Sign-in protection"
        meta="2FA methods"
      >

        <div className="bss-method-row flex items-center gap-5 px-8 py-6 max-[860px]:flex-wrap max-[860px]:items-start max-[860px]:px-6">
          <div className="bss-method-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,var(--cl-accent-soft-11)_0%,var(--cl-accent-soft-10)_100%)] text-[var(--cl-accent-deep)]" aria-hidden="true">
            <MailIcon />
          </div>
          <div className="bss-method-content min-w-0 flex-1">
            <div className="bss-method-title mb-1 [font-family:var(--cl-font-serif)] text-[var(--cl-title-sm)] font-normal tracking-[-0.015em] text-[var(--cl-surface-ink-2)]">Email code</div>
            <div className="bss-method-desc text-[var(--cl-text-lg)] leading-[1.55] text-[var(--cl-surface-muted-9)]">A one-time code sent to your email address each time you sign in.</div>
          </div>
          <StatusPill ariaLabel="Email code is active" label="Active" />
        </div>

        <div className="bss-method-row flex items-center gap-5 border-t border-t-[var(--cl-border-2)] px-8 py-6 max-[860px]:flex-wrap max-[860px]:items-start max-[860px]:px-6">
          <div
            className={`bss-method-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] text-[var(--cl-accent-deep)] ${
              authenticatorAppConfigured || hasSecuritySnapshot
                ? 'bss-method-icon--active bg-[linear-gradient(135deg,var(--cl-accent-soft-13)_0%,var(--cl-accent-soft-11)_100%)]'
                : 'bg-[linear-gradient(135deg,var(--cl-accent-soft-11)_0%,var(--cl-accent-soft-10)_100%)]'
            }`}
            aria-hidden="true"
          >
            <DeviceLockIcon size={24} />
          </div>
          <div className="bss-method-content min-w-0 flex-1">
            <div className="bss-method-title mb-1 [font-family:var(--cl-font-serif)] text-[var(--cl-title-sm)] font-normal tracking-[-0.015em] text-[var(--cl-surface-ink-2)]">Authenticator app</div>
            <div className="bss-method-desc text-[var(--cl-text-lg)] leading-[1.55] text-[var(--cl-surface-muted-9)]">
              {authenticatorAppConfigured
                ? 'Authenticator app verification is active for this account.'
                : 'Required - set up an authenticator app to unlock the rest of Clausule.'}
            </div>
          </div>
          {authenticatorAppConfigured ? (
            <StatusPill ariaLabel="Authenticator app is active" label="Active" />
          ) : hasSecuritySnapshot ? (
            <Button
              type="button"
              variant="primary"
              className="bss-method-action min-w-[94px] shrink-0 rounded-lg border-[1.5px] border-[var(--cl-accent-deep)] bg-transparent px-[18px] py-[9px] text-[var(--cl-text-base)] text-[var(--cl-accent-deep)] shadow-none hover:bg-[var(--cl-accent-soft-10)] focus-visible:outline-[var(--cl-accent-deep)] max-[860px]:ml-auto"
              onClick={onToggleTotp}
              aria-expanded={totpExpanded}
              aria-controls="totp-setup"
            >
              {totpExpanded ? 'Cancel' : 'Set up'}
            </Button>
          ) : (
            <span className="bss-method-loading whitespace-nowrap text-[var(--cl-text-base)] font-semibold text-[var(--cl-surface-muted-8)]" aria-busy="true">Loading authenticator status...</span>
          )}
        </div>

        {!authenticatorAppConfigured && hasSecuritySnapshot && totpExpanded && (
          <BragSecuritySetupPanel onDone={onTotpDone} onCancel={onToggleTotp} />
        )}

        {!authenticatorAppConfigured && hasSecuritySnapshot && (
          <div
            className={`bss-alert flex items-start gap-3.5 border-t-2 border-t-[var(--cl-accent-deep)] px-8 pb-5 pt-4 max-[860px]:px-6 ${
              mfaRestrictionEnabled ? 'bss-alert--required bg-[var(--cl-surface-paper)]' : 'bg-[var(--cl-surface-paper-3)]'
            }`}
            role="alert"
          >
            <span className="bss-alert-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--cl-accent-deep)] text-[var(--cl-surface-white)]" aria-hidden="true">
              <TimerIcon />
            </span>
            <div className="bss-alert-copy min-w-0">
              <div className="bss-alert-title mb-[3px] text-[var(--cl-text-base)] font-bold text-[var(--cl-accent-deeper)]">Authenticator setup required</div>
              <p className="bss-alert-desc inline text-[var(--cl-text-lg)] leading-[1.55] text-[var(--cl-surface-muted-9)]">
                This keeps your account protected.{' '}
                <button
                  type="button"
                  className="alert-link border-0 bg-transparent p-0 font-inherit text-[var(--cl-accent-deep)] underline underline-offset-4 transition-colors hover:text-[var(--cl-accent-deeper)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-accent-deep)]"
                  onClick={onToggleTotp}
                >
                  Set it up now
                </button>{' '}
                to continue using the app.
              </p>
            </div>
          </div>
        )}
      </SectionCard>
    </section>
  )
}
