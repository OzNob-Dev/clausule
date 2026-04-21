'use client'

import { useEffect, useState } from 'react'
import BragRail from '@features/brag/components/BragRail'
import BragSettingsDangerZone from '@features/brag/components/BragSettingsDangerZone'
import BragSettingsIdentity from '@features/brag/components/BragSettingsIdentity'
import DeleteAccountModal from '@features/brag/components/DeleteAccountModal'
import MfaSecuritySection from '@features/brag/components/MfaSecuritySection'
import SsoStatusSection from '@features/brag/components/SsoStatusSection'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { apiFetch } from '@shared/utils/api'
import '@features/brag/styles/brag-shell.css'
import '@features/brag/styles/brag-settings-core.css'
import '@features/brag/styles/brag-settings-totp.css'

function profileDisplayName(profile) {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || 'Your profile'
}

export default function BragSettings() {
  const profile = useProfileStore((state) => state.profile)
  const authenticatorAppConfigured = useProfileStore((state) => state.security.authenticatorAppConfigured)
  const ssoConfigured = useProfileStore((state) => state.security.ssoConfigured)
  const setSecurity = useProfileStore((state) => state.setSecurity)
  const hasSecuritySnapshot = useProfileStore((state) => state.hasSecuritySnapshot)
  const showMfaSection = !ssoConfigured
  const mfaRestrictionEnabled = showMfaSection && hasSecuritySnapshot && !authenticatorAppConfigured

  const [totpExpanded, setTotpExpanded]     = useState(false)

  const [deleteModal, setDeleteModal] = useState(false)

  const handleTotpDone = () => {
    setSecurity({ authenticatorAppConfigured: true })
    setTotpExpanded(false)
  }

  useEffect(() => {
    const controller = new AbortController()

    apiFetch('/api/auth/totp/status', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (typeof data?.configured === 'boolean') setSecurity({ authenticatorAppConfigured: data.configured })
      })
      .catch(() => {})

    return () => controller.abort()
  }, [setSecurity])

  const displayName = profileDisplayName(profile)

  const avatarInitials =
    ((profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')).toUpperCase() ||
    profile.email?.[0]?.toUpperCase() ||
    '?'

  return (
    <div className="be-page">
      <BragRail activePage="settings" />

      <BragSettingsIdentity avatarInitials={avatarInitials} displayName={displayName} email={profile.email} />

      <main className="be-main" aria-labelledby="brag-settings-title">
        <div className="be-inner">
          <h1 id="brag-settings-title" className="bss-heading">Security settings</h1>
          <p className="bss-subheading">Manage how you sign in to Clausule.</p>
          <div className="bss-divider" />

          {ssoConfigured && (
            <SsoStatusSection
              avatarInitials={avatarInitials}
              displayName={displayName}
              email={profile.email}
            />
          )}

          {showMfaSection && (
            <MfaSecuritySection
              authenticatorAppConfigured={authenticatorAppConfigured}
              hasSecuritySnapshot={hasSecuritySnapshot}
              mfaRestrictionEnabled={mfaRestrictionEnabled}
              totpExpanded={totpExpanded}
              onTotpDone={handleTotpDone}
              onToggleTotp={() => setTotpExpanded((v) => !v)}
            />
          )}

          <BragSettingsDangerZone onDelete={() => setDeleteModal(true)} />
        </div>
      </main>

      <DeleteAccountModal open={deleteModal} onClose={() => setDeleteModal(false)} />
    </div>
  )
}
