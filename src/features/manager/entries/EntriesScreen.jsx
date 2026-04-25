'use client'

import { ManagerWorkspacePlaceholder } from '@features/manager/components/ManagerWorkspacePlaceholder'

export default function Entries() {
  return (
    <ManagerWorkspacePlaceholder
      title="Entry search"
      description="Manager file-note search is unavailable until search queries and result ranking are backed by live employee records."
      detail="The timer-driven mock search and sample entries were removed so search results never imply real file history."
      actionHref="/profile"
      actionLabel="Open profile"
    />
  )
}
