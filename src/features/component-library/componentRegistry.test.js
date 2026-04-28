import { describe, expect, it } from 'vitest'
import { discoverComponentSources, getComponentLibraryEntries } from './componentRegistry'

describe('component registry', () => {
  it('covers every discoverable component and page source', () => {
    const sources = discoverComponentSources()
    const entries = getComponentLibraryEntries()

    expect(entries.map((entry) => entry.sourcePath).sort()).toEqual(sources)
    expect(entries.every((entry) => ['atoms', 'molecules', 'organisms', 'templates', 'pages'].includes(entry.layer))).toBe(true)
  })

  it('includes the expected shared and route surfaces', () => {
    const entries = getComponentLibraryEntries()
    const paths = new Set(entries.map((entry) => entry.sourcePath))

    expect(paths.has('src/shared/components/ui/Button.jsx')).toBe(true)
    expect(paths.has('src/shared/components/layout/AppShell.jsx')).toBe(true)
    expect(paths.has('src/app/(protected)/components/page.jsx')).toBe(true)
  })
})
