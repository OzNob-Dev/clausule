import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ComponentLibraryScreen } from './ComponentLibraryScreen'
import { getComponentLibraryEntries } from './componentRegistry'

describe('ComponentLibraryScreen', () => {
  it('lets the user switch button variants', async () => {
    const user = userEvent.setup()
    render(<ComponentLibraryScreen entries={getComponentLibraryEntries().filter((entry) => entry.id.endsWith('Button.jsx') || entry.id.endsWith('Button'))} />)

    await user.click(screen.getByRole('button', { name: /^Button$/ }))
    await user.selectOptions(screen.getByLabelText('Variant'), 'ghost')

    expect(screen.getByRole('button', { name: 'Save changes' })).toHaveClass('bg-transparent')
  })

  it('opens and closes the modal preview', async () => {
    const user = userEvent.setup()
    render(<ComponentLibraryScreen entries={getComponentLibraryEntries().filter((entry) => entry.previewKind === 'modal') || getComponentLibraryEntries()} />)

    await user.click(screen.getByRole('button', { name: /^Modal$/ }))
    await user.click(screen.getByRole('button', { name: /^Open dialog$/ }))

    expect(screen.getByRole('dialog', { name: 'Confirm component usage' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Close$/ }))

    expect(screen.queryByRole('dialog', { name: 'Confirm component usage' })).not.toBeInTheDocument()
  })

  it('toggles code email reveal state', async () => {
    const user = userEvent.setup()
    render(<ComponentLibraryScreen entries={getComponentLibraryEntries().filter((entry) => entry.previewKind === 'code-email')} />)

    await user.click(screen.getByRole('button', { name: /^Code Email$/ }))
    await user.click(screen.getByRole('button', { name: /^Reveal code$/ }))

    expect(screen.getByLabelText('Verification code sent to your email')).toHaveTextContent('246810')
  })

  it('changes loader variants', async () => {
    const user = userEvent.setup()
    render(<ComponentLibraryScreen entries={getComponentLibraryEntries().filter((entry) => entry.previewKind === 'page-loader')} />)

    await user.click(screen.getByRole('button', { name: /^Page Loader$/ }))
    await user.selectOptions(screen.getByLabelText('Variant'), 'auth')

    expect(screen.getByRole('status', { name: 'Signing in' })).toBeInTheDocument()
  })

  it('switches avatar size tokens', async () => {
    const user = userEvent.setup()
    render(<ComponentLibraryScreen entries={getComponentLibraryEntries().filter((entry) => entry.previewKind === 'avatar')} />)

    await user.click(screen.getByRole('button', { name: /^Avatar$/ }))
    await user.click(screen.getByRole('button', { name: /^lg$/ }))

    expect(screen.getByText('AL')).toHaveClass('h-12', 'w-12')
  })
})
