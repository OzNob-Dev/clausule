'use client'

import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import BragSecurityDangerZone from '@shared/components/BragSecurityDangerZone'
import BragSecurityMethodsCard from '@shared/components/BragSecurityMethodsCard'
import PageHeader from '@shared/components/ui/PageHeader'
import { DeleteAccountDialog } from '@shared/components/DeleteAccountDialog'
import { useProfileStore } from '@auth/store/useProfileStore'
import { useTotpStatusQuery } from '@shared/queries/useProfileQuery'

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
        className="bss-header mb-8"
        eyebrow="Account"
        eyebrowAriaHidden
        eyebrowClassName="bss-eyebrow mb-[10px] text-[var(--cl-text-sm)] font-bold uppercase tracking-[0.14em] text-[var(--cl-accent-deep)]"
        title="Security settings"
        titleClassName="bss-heading [font-family:var(--cl-font-serif)] text-[clamp(2.5rem,4.6vw,3.4rem)] leading-[1.02] tracking-[-0.02em] text-[var(--cl-surface-ink-2)]"
        titleId="brag-settings-title"
        description="Manage how you sign in to Clausule."
        descriptionClassName="bss-subheading text-[clamp(1rem,1.8vw,1.125rem)] leading-[1.6] text-[var(--cl-surface-muted-9)]"
      />
      <div className="bss-divider mb-11 h-0.5 bg-[linear-gradient(90deg,var(--cl-accent-deep)_0%,var(--cl-accent-soft-11)_58%,transparent_100%)]" />
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
