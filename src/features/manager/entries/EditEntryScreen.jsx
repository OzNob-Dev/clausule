'use client'

import { ManagerWorkspacePlaceholder } from '@features/manager/components/ManagerWorkspacePlaceholder'

export default function EditEntry() {
  return (
    <ManagerWorkspacePlaceholder
      title="Edit file note"
      description="Manager note editing stays disabled until existing records can be loaded and saved from live storage."
      detail="The hard-coded example entry and timer-based delete flow were removed so this screen never implies a real employee note was changed."
      actionHref="/dashboard"
      actionLabel="Back to dashboard"
    />
  )
}
