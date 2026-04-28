'use client'

import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import BragSettingsDangerZone from '@features/brag/components/BragSettingsDangerZone'
import MfaSecuritySection from '@features/brag/components/MfaSecuritySection'
import { DeleteAccountDialog } from '@features/account/components/DeleteAccountDialog'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { useTotpStatusQuery } from '@shared/queries/useProfileQuery'
import '@features/brag/styles/brag-settings-core.css'
import '@features/brag/styles/brag-settings-totp.css'
import '@shared/styles/page-loader.css'

export default function BragSettings() {
  const {
    setSecurity,
    authenticatorAppConfigured,
    hasSecuritySnapshot,
  } = useProfileStore(useShallow((state) => ({
    setSecurity: state.setSecurity,
    authenticatorAppConfigured: state.security.authenticatorAppConfigured,
    hasSecuritySnapshot: state.hasSecuritySnapshot,
  })))
  const mfaRestrictionEnabled = hasSecuritySnapshot && !authenticatorAppConfigured

  const [totpExpanded, setTotpExpanded] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const totpStatusQuery = useTotpStatusQuery()

  useEffect(() => {
    if (typeof totpStatusQuery.data?.configured === 'boolean') {
      setSecurity({ authenticatorAppConfigured: totpStatusQuery.data.configured })
    }
  }, [setSecurity, totpStatusQuery.data])

  const handleTotpDone = () => {
    setSecurity({ authenticatorAppConfigured: true })
    setTotpExpanded(false)
  }
  return (
    <>
      <main className="be-main page-enter bss-screen" aria-labelledby="brag-settings-title">
        <div className="be-inner bss-page">
          <header className="bss-header">
            <h1 id="brag-settings-title" className="bss-heading">Security settings</h1>
            <p className="bss-subheading">Manage how you sign in to Clausule.</p>
          </header>
          <div className="bss-divider" />
          <MfaSecuritySection
            authenticatorAppConfigured={authenticatorAppConfigured}
            hasSecuritySnapshot={hasSecuritySnapshot}
            mfaRestrictionEnabled={mfaRestrictionEnabled}
            totpExpanded={totpExpanded}
            onTotpDone={handleTotpDone}
            onToggleTotp={() => setTotpExpanded((v) => !v)}
          />
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
