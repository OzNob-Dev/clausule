'use client'

import { ManagerWorkspacePlaceholder } from '@features/manager/components/ManagerWorkspacePlaceholder'

export default function Escalated() {
  return (
    <ManagerWorkspacePlaceholder
      title="Escalated"
      description="Escalation review is unavailable until HR process records are backed by live data with access controls."
      detail="The sample escalations were removed so this route does not expose fictional employee incidents as if they were real cases."
      actionHref="/dashboard"
      actionLabel="Back to dashboard"
    />
  )
}
