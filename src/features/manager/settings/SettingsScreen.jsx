'use client'

import { useCallback, useState } from 'react'
import { ManagerWorkspacePlaceholder } from '@features/manager/components/ManagerWorkspacePlaceholder'
import DeleteAccountSection from '@features/manager/settings/DeleteAccountSection'
import '@features/manager/styles/settings-danger.css'

export default function Settings() {
  const [deleteModal, setDeleteModal] = useState(false)
  const openDelete = useCallback(() => setDeleteModal(true), [])
  const closeDelete = useCallback(() => setDeleteModal(false), [])

  return (
    <ManagerWorkspacePlaceholder
      title="Signal settings"
      description="Live HR alert thresholds, automation rules, and flagged employee records are not connected in this build yet."
      detail="Placeholder settings and demo risk data have been removed so this route does not imply saved automation or live monitoring."
      actionLabel="Open profile"
    >
      <div className="mx-auto max-w-[52rem]">
        <div className="rounded-[28px] border border-border bg-canvas p-6 max-sm:p-5">
          <DeleteAccountSection
            deleteModal={deleteModal}
            onCloseModal={closeDelete}
            onOpenDelete={openDelete}
          />
        </div>
      </div>
    </ManagerWorkspacePlaceholder>
  )
}
