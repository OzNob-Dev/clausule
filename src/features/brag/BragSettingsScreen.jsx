'use client'

import { useEffect, useState } from 'react'
import BragRail from '@features/brag/components/BragRail'
import BragIdentitySidebar from '@features/brag/components/BragIdentitySidebar'
import BragSettingsDangerZone from '@features/brag/components/BragSettingsDangerZone'
import DeleteAccountModal from '@features/brag/components/DeleteAccountModal'
import MfaSecuritySection from '@features/brag/components/MfaSecuritySection'
import SsoStatusSection from '@features/brag/components/SsoStatusSection'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { useProfileQuery, useTotpStatusQuery } from '@shared/queries/useProfileQuery'
import { profileDisplayName, profileInitials } from '@shared/utils/profile'
import '@features/brag/styles/brag-shell.css'
import '@features/brag/styles/brag-settings-core.css'
import '@features/brag/styles/brag-settings-totp.css'

export default function BragSettings() {
  const profile = useProfileStore((state) => state.profile)
  const setProfile = useProfileStore((state) => state.setProfile)
  const setSecurity = useProfileStore((state) => state.setSecurity)
  const authenticatorAppConfigured = useProfileStore((state) => state.security.authenticatorAppConfigured)
  const ssoConfigured = useProfileStore((state) => state.security.ssoConfigured)
  const hasSecuritySnapshot = useProfileStore((state) => state.hasSecuritySnapshot)
  const showMfaSection = !ssoConfigured
  const mfaRestrictionEnabled = showMfaSection && hasSecuritySnapshot && !authenticatorAppConfigured

  const [totpExpanded, setTotpExpanded]           = useState(false)
  const [deleteModal, setDeleteModal]               = useState(false)

  const profileQuery = useProfileQuery()
  const totpStatusQuery = useTotpStatusQuery()

  useEffect(() => {
    const data = profileQuery.data
    const profileData = {
      firstName: typeof data?.firstName === 'string' ? data.firstName : undefined,
      lastName: typeof data?.lastName === 'string' ? data.lastName : undefined,
      email: typeof data?.email === 'string' ? data.email : undefined,
      mobile: typeof data?.mobile === 'string' ? data.mobile : undefined,
      jobTitle: typeof data?.jobTitle === 'string' ? data.jobTitle : undefined,
      department: typeof data?.department === 'string' ? data.department : undefined,
    }
    if (Object.values(profileData).some((value) => value !== undefined)) setProfile(profileData)
  }, [profileQuery.data, setProfile])

  useEffect(() => {
    if (typeof totpStatusQuery.data?.configured === 'boolean') {
      setSecurity({ authenticatorAppConfigured: totpStatusQuery.data.configured })
    }
  }, [setSecurity, totpStatusQuery.data])

  const handleTotpDone = () => {
    setSecurity({ authenticatorAppConfigured: true })
    setTotpExpanded(false)
  }

  const displayName    = profileDisplayName(profile)
  const avatarInitials = profileInitials(profile)

  return (
    <div className="be-page">
      <BragRail activePage="settings" />

      <BragIdentitySidebar
        ariaLabel="Profile"
        eyebrow="Clausule · Settings"
        noteLabel="Account security"
        note="Manage two-factor authentication for secure sign-in."
        avatarInitials={avatarInitials}
        displayName={displayName}
        email={profile.email}
      />

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

          <section className="bss-reminders" aria-labelledby="bss-reminders-title">
            <div className="bss-section-label" id="bss-reminders-title">Notifications</div>
            <div className="bss-card bss-reminder-card">
              <div className="bss-reminder-head">
                <div>
                  <div className="bss-reminder-title">Preference sync is unavailable</div>
                  <div className="bss-reminder-desc">
                    Local-only reminder toggles were removed until notification preferences can be saved to your account.
                  </div>
                </div>
                <div className="bss-reminder-summary" aria-live="polite">Live settings pending</div>
              </div>
            </div>
          </section>

          <BragSettingsDangerZone onDelete={() => setDeleteModal(true)} />
        </div>
      </main>

      <DeleteAccountModal open={deleteModal} onClose={() => setDeleteModal(false)} />
    </div>
  )
}
