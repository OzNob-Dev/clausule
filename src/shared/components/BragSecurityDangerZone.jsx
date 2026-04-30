'use client'
import './BragSecurityDangerZone.css'

import { Button } from '@shared/components/ui/Button'
import { SectionCard } from '@shared/components/ui/SectionCard'
import { TrashIcon } from '@shared/components/ui/icon/TrashIcon'

export default function BragSecurityDangerZone({ onDelete }) {
  return (
    <section className="bss-danger-section" aria-labelledby="security-danger-title">
      <div className="bss-danger-label" id="security-danger-title">Danger zone</div>
      <SectionCard
        className="danger-card bss-danger-card"
        headerClassName="danger-card-head bss-danger-card-head"
        titleClassName="bss-danger-card-head-title"
        metaClassName="bss-danger-card-head-meta"
        title="Irreversible actions"
        meta="Proceed with care"
      >
        <div className="bss-danger-row">
          <div className="bss-danger-copy">
            <div className="bss-danger-desc">
              Permanently removes your account and all brag doc entries, files, and records. This cannot be undone.
            </div>
          </div>
          <Button type="button" variant="danger" className="bss-btn-danger" onClick={onDelete}>
            <TrashIcon />
            Delete account
          </Button>
        </div>
      </SectionCard>
    </section>
  )
}
