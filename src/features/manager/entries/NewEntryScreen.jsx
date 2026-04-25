'use client'

import { ManagerWorkspacePlaceholder } from '@features/manager/components/ManagerWorkspacePlaceholder'

export default function NewEntry() {
  return (
    <ManagerWorkspacePlaceholder
      title="New file note"
      description="Manager note creation is disabled until this form writes to a real persistence layer and employee directory."
      detail="The local-only draft form and fake save redirect were removed so this route never suggests a note was stored when nothing was written."
      actionHref="/dashboard"
      actionLabel="Back to dashboard"
    />
  )
}
