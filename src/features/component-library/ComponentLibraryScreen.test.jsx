import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ComponentLibraryScreen } from './ComponentLibraryScreen'
import { getComponentLibraryEntries } from './componentRegistry'

describe('ComponentLibraryScreen', () => {
  const pick = (...ids) => getComponentLibraryEntries().filter((entry) => ids.includes(entry.id))

  it('lets the user switch button variants', async () => {
    const user = userEvent.setup()
    render(<ComponentLibraryScreen entries={pick('src/features/signup/components/SignupButtons.jsx#CtaBtn')} />)

    await user.click(screen.getByRole('button', { name: 'CtaBtn' }))
    await user.selectOptions(screen.getByLabelText('Variant'), 'ghost')

    expect(screen.getByRole('button', { name: 'Save changes' })).toHaveClass('bg-transparent')
  })

  it('opens and closes the modal preview', async () => {
    const user = userEvent.setup()
    render(<ComponentLibraryScreen entries={pick('src/shared/components/ui/Modal.jsx#Modal')} />)

    await user.click(screen.getByRole('button', { name: 'Modal' }))
    await user.click(screen.getByRole('button', { name: /^Open dialog$/ }))

    expect(screen.getByRole('dialog', { name: 'Confirm component usage' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Close$/ }))

    expect(screen.queryByRole('dialog', { name: 'Confirm component usage' })).not.toBeInTheDocument()
  })

  it('toggles code email reveal state', async () => {
    const user = userEvent.setup()
    render(<ComponentLibraryScreen entries={pick('src/shared/components/ui/CodeEmail.jsx#CodeEmail')} />)

    await user.click(screen.getByRole('button', { name: 'CodeEmail' }))
    await user.click(screen.getByRole('button', { name: /^Reveal code$/ }))

    expect(screen.getByLabelText('Verification code sent to your email')).toHaveTextContent('246810')
  })

  it('changes loader variants', async () => {
    const user = userEvent.setup()
    render(<ComponentLibraryScreen entries={pick('src/shared/components/ui/PageLoader.jsx#PageLoader')} />)

    await user.click(screen.getByRole('button', { name: 'PageLoader' }))
    await user.selectOptions(screen.getByLabelText('Variant'), 'auth')

    expect(screen.getByRole('status', { name: 'Signing in' })).toBeInTheDocument()
  })

  it('switches avatar size tokens', async () => {
    const user = userEvent.setup()
    render(<ComponentLibraryScreen entries={pick('src/shared/components/ui/Avatar.jsx#Avatar')} />)

    await user.click(screen.getByRole('button', { name: 'Avatar' }))
    await user.click(screen.getByRole('button', { name: /^lg$/ }))

    expect(screen.getByText('AL')).toHaveClass('h-12', 'w-12')
  })

  it('smokes link, card, icon, and page surfaces', () => {
    render(
      <ComponentLibraryScreen
        entries={pick(
          'src/features/auth/components/SsoProviderButton.jsx#SsoProviderButton',
          'src/features/brag/components/EntryCard.jsx#EntryCard',
          'src/features/auth/components/SignInBrandPanel.jsx#BrandBugIcon',
          'src/app/(protected)/components/page.jsx#Page'
        )}
      />
    )

    expect(screen.getByRole('button', { name: 'SsoProviderButton' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EntryCard' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'BrandBugIcon' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page' })).toBeInTheDocument()
  })
})
