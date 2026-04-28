import { describe, expect, it } from 'vitest'
import { discoverComponentSources, getComponentLibraryEntries } from './componentRegistry'

describe('component registry', () => {
  it('covers every discoverable component and page source', () => {
    const sources = discoverComponentSources()
    const entries = getComponentLibraryEntries()
    const entrySources = [...new Set(entries.map((entry) => entry.sourcePath))].sort()

    expect(entrySources).toEqual(sources)
    expect(entries.every((entry) => ['atoms', 'molecules', 'organisms', 'templates', 'pages'].includes(entry.layer))).toBe(true)
  })

  it('keeps multi-export files split into separate catalog entries', () => {
    const entries = getComponentLibraryEntries()
    const ids = new Set(entries.map((entry) => entry.id))
    const counts = entries.reduce((acc, entry) => acc.set(entry.sourcePath, (acc.get(entry.sourcePath) ?? 0) + 1), new Map())

    for (const id of [
      'src/shared/components/ui/Card.jsx#Card',
      'src/shared/components/ui/Field.jsx#Field',
      'src/shared/components/ui/Field.jsx#FieldHint',
      'src/shared/components/ui/Field.jsx#FieldInput',
      'src/shared/components/ui/Field.jsx#FieldLabel',
      'src/shared/components/ui/Link.jsx#Link',
      'src/features/signup/components/SignupFormField.jsx#SignupFormField',
      'src/features/signup/components/SignupButtons.jsx#CtaBtn',
      'src/features/signup/components/SignupButtons.jsx#BackBtn',
      'src/features/signup/components/SignupIcons.jsx#CheckIcon',
      'src/features/signup/components/SignupIcons.jsx#ArrowIcon',
      'src/features/signup/components/SignupIcons.jsx#BackIcon',
      'src/features/auth/components/SignInBrandPanel.jsx#BrandBugIcon',
      'src/features/auth/components/SignInBrandPanel.jsx#SignInBrandPanel',
      'src/features/auth/components/SsoProviderButton.jsx#SsoProviderButton',
      'src/features/brag/components/EntryCard.jsx#EntryCard',
      'src/features/account/components/DeleteAccountDialog.jsx#DeleteAccountDialog',
      'src/features/account/components/VerifyChangesModal.jsx#VerifyChangesModal',
      'src/app/(protected)/components/page.jsx#Page',
    ]) {
      expect(ids.has(id)).toBe(true)
    }

    expect(counts.get('src/features/signup/components/SignupButtons.jsx')).toBe(2)
    expect(counts.get('src/shared/components/ui/Card.jsx')).toBe(1)
    expect(counts.get('src/shared/components/ui/Field.jsx')).toBe(4)
    expect(counts.get('src/shared/components/ui/Link.jsx')).toBe(1)
    expect(counts.get('src/features/signup/components/SignupIcons.jsx')).toBe(3)
    expect(counts.get('src/features/auth/components/SignInBrandPanel.jsx')).toBe(2)
    expect(counts.get('src/features/signup/components/SignupFormField.jsx')).toBe(1)
  })
})
