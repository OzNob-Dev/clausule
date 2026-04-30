import { AppShell } from '@shared/components/layout/AppShell'
import LoadingOverlay from '@shared/components/ui/LoadingOverlay'

export default function Loading() {
  return (
    <AppShell>
      <div className="relative min-h-[55vh] w-full overflow-hidden">
        <LoadingOverlay />
      </div>
    </AppShell>
  )
}
