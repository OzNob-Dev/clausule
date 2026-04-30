import { AppShell } from '@shared/components/layout/AppShell'
import PageLoader from '@shared/components/ui/PageLoader'

export default function Loading() {
  return (
    <AppShell>
      <div className="flex min-h-[55vh] items-center justify-center px-6 py-10">
        <PageLoader variant="app" />
      </div>
    </AppShell>
  )
}
