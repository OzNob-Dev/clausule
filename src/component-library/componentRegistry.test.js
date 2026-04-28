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
      'src/shared/components/ui/SignupButtons.jsx#CtaBtn',
      'src/shared/components/ui/SignupButtons.jsx#BackBtn',
      'src/shared/components/ui/SignupIcons.jsx#CheckIcon',
      'src/shared/components/ui/SignupIcons.jsx#ArrowIcon',
      'src/shared/components/ui/SignupIcons.jsx#BackIcon',
      'src/shared/components/ui/BrandBugIcon.jsx#BrandBugIcon',
      'src/shared/components/ui/AuthBrandPanel.jsx#AuthBrandPanel',
      'src/shared/components/ui/SignInBrandPanel.jsx#SignInBrandPanel',
      'src/shared/components/ui/SignInEmailForm.jsx#SignInEmailForm',
      'src/shared/components/ui/SignUpPrompt.jsx#SignUpPrompt',
      'src/shared/components/ui/SsoButtons.jsx#SsoButtons',
      'src/shared/components/ui/SsoProviderButton.jsx#SsoProviderButton',
      'src/shared/components/ui/SsoProviderIcon.jsx#SsoProviderIcon',
      'src/features/brag/components/EntryCard.jsx#EntryCard',
      'src/features/account/components/DeleteAccountDialog.jsx#DeleteAccountDialog',
      'src/features/account/components/VerifyChangesModal.jsx#VerifyChangesModal',
      'src/app/(protected)/components/page.jsx#Page',
    ]) {
      expect(ids.has(id)).toBe(true)
    }

    expect(counts.get('src/shared/components/ui/SignupButtons.jsx')).toBe(2)
    expect(counts.get('src/shared/components/ui/Card.jsx')).toBe(1)
    expect(counts.get('src/shared/components/ui/Field.jsx')).toBe(7)
    expect(counts.get('src/shared/components/ui/Link.jsx')).toBe(1)
    expect(counts.get('src/shared/components/ui/SignupIcons.jsx')).toBe(3)
    expect(counts.get('src/shared/components/ui/BrandBugIcon.jsx')).toBe(1)
    expect(counts.get('src/shared/components/ui/AuthBrandPanel.jsx')).toBe(1)
    expect(counts.get('src/shared/components/ui/SignInBrandPanel.jsx')).toBe(1)
    expect(counts.get('src/shared/components/ui/SignInEmailForm.jsx')).toBe(1)
    expect(counts.get('src/shared/components/ui/SignUpPrompt.jsx')).toBe(1)
    expect(counts.get('src/shared/components/ui/SsoButtons.jsx')).toBe(1)
    expect(counts.get('src/shared/components/ui/SsoProviderButton.jsx')).toBe(1)
    expect(counts.get('src/shared/components/ui/SsoProviderIcon.jsx')).toBe(1)
    expect(counts.get('src/features/signup/components/SignupFormField.jsx')).toBe(1)
  })
})
