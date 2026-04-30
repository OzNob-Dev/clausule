'use client'

import { Button } from '@shared/components/ui/Button'
import { SectionCard } from '@shared/components/ui/SectionCard'

function TrashIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="2 4 3 4 12 4" />
      <path d="M11 4l-.7 8a1 1 0 0 1-1 1H4.7a1 1 0 0 1-1-1L3 4" />
      <path d="M5.5 4V3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1" />
    </svg>
  )
}

export default function BragSecurityDangerZone({ onDelete }) {
  return (
    <section className="bss-danger-section" aria-labelledby="security-danger-title">
      <div className="bss-danger-label" id="security-danger-title">Danger zone</div>
      <SectionCard
        className="bss-danger-card"
        headerClassName="bss-danger-card-head"
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
          <Button type="button" variant="danger" className="danger" onClick={onDelete}>
            <TrashIcon />
            Delete account
          </Button>
        </div>
      </SectionCard>
    </section>
  )
}
