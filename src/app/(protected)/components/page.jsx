import { AppShell } from '@shared/components/layout/AppShell'
import { ComponentLibraryScreen } from '@features/component-library/ComponentLibraryScreen'
import { getComponentLibraryEntries } from '@features/component-library/componentRegistry'

export default function Page() {
  return (
    <AppShell>
      <ComponentLibraryScreen entries={getComponentLibraryEntries()} />
    </AppShell>
  )
}
