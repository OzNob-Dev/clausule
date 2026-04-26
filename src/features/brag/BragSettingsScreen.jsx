'use client'

import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import BragSettingsDangerZone from '@features/brag/components/BragSettingsDangerZone'
import MfaSecuritySection from '@features/brag/components/MfaSecuritySection'
import SsoStatusSection from '@features/brag/components/SsoStatusSection'
import { DeleteAccountDialog } from '@features/account/components/DeleteAccountDialog'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { useProfileQuery, useTotpStatusQuery } from '@shared/queries/useProfileQuery'
import { profileDisplayName, profileInitials } from '@shared/utils/profile'
import '@features/brag/styles/brag-settings-core.css'
import '@features/brag/styles/brag-settings-totp.css'

export default function BragSettings() {
  const {
    profile,
    setProfile,
    setSecurity,
    authenticatorAppConfigured,
    ssoConfigured,
    hasSecuritySnapshot,
  } = useProfileStore(useShallow((state) => ({
    profile: state.profile,
    setProfile: state.setProfile,
    setSecurity: state.setSecurity,
    authenticatorAppConfigured: state.security.authenticatorAppConfigured,
    ssoConfigured: state.security.ssoConfigured,
    hasSecuritySnapshot: state.hasSecuritySnapshot,
  })))
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
    <>
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
      <DeleteAccountDialog
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        description="This will permanently delete your brag doc and all associated entries, evidence files, and records from our servers. This action cannot be undone."
      />
    </>
  )
}
