'use client'

import { useState } from 'react'
import BragRail from '@features/brag/components/BragRail'
import BragSettingsDangerZone from '@features/brag/components/BragSettingsDangerZone'
import BragSettingsIdentity from '@features/brag/components/BragSettingsIdentity'
import DeleteAccountModal from '@features/brag/components/DeleteAccountModal'
import MfaSecuritySection from '@features/brag/components/MfaSecuritySection'
import SsoStatusSection from '@features/brag/components/SsoStatusSection'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import '@features/brag/styles/brag-shell.css'
import '@features/brag/styles/brag-settings-core.css'
import '@features/brag/styles/brag-settings-totp.css'

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

  const displayName =
    profile.firstName || profile.lastName
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : profile.email || 'Your profile'

  const avatarInitials =
    ((profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')).toUpperCase() ||
    profile.email?.[0]?.toUpperCase() ||
    '?'

  return (
    <div className="be-page">
      <BragRail activePage="settings" />

      <BragSettingsIdentity avatarInitials={avatarInitials} displayName={displayName} email={profile.email} />

      <main className="be-main">
        <div className="be-inner">
          <div className="bss-heading">Security settings</div>
          <div className="bss-subheading">Manage how you sign in to Clausule.</div>
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
