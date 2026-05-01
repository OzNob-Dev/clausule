'use client'

import { Button } from '@shared/components/ui/Button'
import { SectionCard } from '@shared/components/ui/SectionCard'
import { TrashIcon } from '@shared/components/ui/icon/TrashIcon'

export default function BragSecurityDangerZone({ onDelete }) {
  return (
    <section className="bss-danger-section mt-[52px] max-[860px]:mt-10" aria-labelledby="security-danger-title">
      <div className="bss-danger-label mb-[10px] flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--cl-danger-5)] after:h-px after:flex-1 after:bg-[var(--cl-danger-alpha-18)] after:content-['']" id="security-danger-title">Danger zone</div>
      <SectionCard
        className="bss-danger-card danger-card border border-[var(--cl-danger-alpha-18)] bg-[var(--cl-surface-white)]"
        headerClassName="bss-danger-card-head danger-card-head flex items-center justify-between gap-4 bg-[#341818] px-8 py-5"
        titleClassName="bss-danger-card-head-title"
        metaClassName="bss-danger-card-head-meta"
        title="Irreversible actions"
        meta="Proceed with care"
      >
        <div className="bss-danger-row flex items-center gap-6 px-8 py-7 max-[860px]:flex-wrap max-[860px]:items-start max-[860px]:px-6 max-[860px]:py-6">
          <div className="bss-danger-copy min-w-0 flex-1">
            <div className="bss-danger-desc text-[14px] leading-[1.55] text-[var(--cl-surface-muted-9)]">
              Permanently removes your account and all brag doc entries, files, and records. This cannot be undone.
            </div>
          </div>
          <Button
            type="button"
            variant="danger"
            className="bss-btn-danger shrink-0 gap-2 rounded-lg border-[1.5px] border-[var(--cl-danger-5)] bg-transparent px-[18px] py-[9px] text-[var(--cl-text-base)] text-[var(--cl-danger-5)] shadow-none hover:bg-[var(--cl-danger-soft)] focus-visible:outline-[var(--cl-accent-strong)] max-[860px]:w-full"
            onClick={onDelete}
          >
            <TrashIcon />
            Delete account
          </Button>
        </div>
      </SectionCard>
    </section>
  )
}
