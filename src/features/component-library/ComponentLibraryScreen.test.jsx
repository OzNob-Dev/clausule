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
    render(<ComponentLibraryScreen entries={pick('src/shared/components/ui/SignupButtons.jsx#CtaBtn')} />)

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

  it('renders the shared link preview', async () => {
    const user = userEvent.setup()
    render(<ComponentLibraryScreen entries={pick('src/shared/components/ui/Link.jsx#Link')} />)

    await user.click(screen.getByRole('button', { name: 'Link' }))

    expect(screen.getByRole('link', { name: 'Continue with email' })).toHaveAttribute('href', '/signup')
    expect(screen.getByRole('link', { name: 'View library' })).toHaveAttribute('href', '/components')
  })

  it('renders the shared card preview', async () => {
    const user = userEvent.setup()
    render(<ComponentLibraryScreen entries={pick('src/shared/components/ui/Card.jsx#Card')} />)

    await user.click(screen.getByRole('button', { name: 'Card' }))

    expect(screen.getByText('Reusable card surface')).toBeInTheDocument()
  })

  it('renders the shared field preview', async () => {
    const user = userEvent.setup()
    render(<ComponentLibraryScreen entries={pick('src/shared/components/ui/Field.jsx#Field')} />)

    await user.click(screen.getByRole('button', { name: 'Field' }))

    expect(screen.getByLabelText('Email address')).toHaveValue('ada@example.com')
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Toggle error$/ }))

    expect(screen.getByText('Field primitives stay composable.')).toBeInTheDocument()
  })

  it('smokes icon, shell, and page surfaces', async () => {
    const user = userEvent.setup()
    render(
      <ComponentLibraryScreen
        entries={pick(
          'src/shared/components/ui/BrandBugIcon.jsx#BrandBugIcon',
          'src/shared/components/ui/AuthBrandPanel.jsx#AuthBrandPanel',
          'src/shared/components/layout/AppShell.jsx#AppShell',
          'src/app/(protected)/components/page.jsx#Page'
        )}
      />
    )

    expect(screen.getByRole('button', { name: 'BrandBugIcon' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'AppShell' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page' })).toBeInTheDocument()
    expect(screen.getByText('Icon-only primitives need contrast, sizing, and context to stay readable.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'AppShell' }))
    expect(screen.getByText('This route runs inside the shared app shell.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Page' }))
    expect(screen.getAllByText('/components').length).toBeGreaterThan(0)
  })
})
