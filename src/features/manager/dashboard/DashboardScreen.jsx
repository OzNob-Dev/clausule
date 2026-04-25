'use client'

import { ManagerWorkspacePlaceholder } from '@features/manager/components/ManagerWorkspacePlaceholder'

export default function Dashboard() {
  return (
    <ManagerWorkspacePlaceholder
      title="Dashboard"
      description="The manager dashboard is hidden until employee records, alert states, and summary metrics are backed by live production data."
      detail="Fixture-driven board columns, search results, and stats were removed so this route does not present demo information as current team health."
      actionHref="/profile"
      actionLabel="Open profile"
    />
  )
}
