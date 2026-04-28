import { AppShell } from '@shared/components/layout/AppShell'
import { ComponentLibraryScreen } from '@component-library/ComponentLibraryScreen'
import { getComponentLibraryEntries } from '@component-library/componentRegistry'

export default function Page() {
  return (
    <AppShell>
      <ComponentLibraryScreen entries={getComponentLibraryEntries()} />
    </AppShell>
  )
}
