'use client'

import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import BragSecurityDangerZone from '@brag/components/BragSecurityDangerZone'
import BragSecurityMethodsCard from '@brag/components/BragSecurityMethodsCard'
import PageHeader from '@shared/components/ui/PageHeader'
import { DeleteAccountDialog } from '@account/components/DeleteAccountDialog'
import { useProfileStore } from '@auth/store/useProfileStore'
import { useTotpStatusQuery } from '@shared/queries/useProfileQuery'
import '@brag/styles/brag-settings-core.css'
import '@brag/styles/brag-settings-totp.css'
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
      <PageHeader
        className="bss-header"
        eyebrow="Account"
        eyebrowAriaHidden
        eyebrowClassName="bss-eyebrow"
        title="Security settings"
        titleClassName="bss-heading"
        titleId="brag-settings-title"
        description="Manage how you sign in to Clausule."
        descriptionClassName="bss-subheading"
      />
      <div className="bss-divider" />
      <BragSecurityMethodsCard
        authenticatorAppConfigured={authenticatorAppConfigured}
        hasSecuritySnapshot={hasSecuritySnapshot}
        mfaRestrictionEnabled={mfaRestrictionEnabled}
        totpExpanded={totpExpanded}
        onTotpDone={handleTotpDone}
        onToggleTotp={() => setTotpExpanded((v) => !v)}
      />
      <BragSecurityDangerZone onDelete={() => setDeleteModal(true)} />
      <DeleteAccountDialog
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
      />
    </>
  )
}
