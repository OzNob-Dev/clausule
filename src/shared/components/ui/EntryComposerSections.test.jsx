import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { EntryEvidenceFilesNotice, EntryEvidenceTypeGroup, EntryStrengthMeter } from './EntryComposerSections'

function Harness() {
  const [selectedTypes, setSelectedTypes] = React.useState(new Set())

  return (
    <EntryEvidenceTypeGroup
      selectedTypes={selectedTypes}
      onToggle={(type) => {
        setSelectedTypes((prev) => {
          const next = new Set(prev)
          next.has(type) ? next.delete(type) : next.add(type)
          return next
        })
      }}
    />
  )
}

describe('EntryComposerSections', () => {
  it('toggles evidence pills', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const pill = screen.getByRole('button', { name: 'Work artefact' })
    expect(pill).toHaveAttribute('aria-pressed', 'false')

    await user.click(pill)
    expect(pill).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders strength levels from evidence count', () => {
    render(<EntryStrengthMeter selectedCount={2} />)

    expect(screen.getByText('Solid')).toBeInTheDocument()
    expect(screen.getByText('One more evidence type reaches Strong')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Entry strength' })).toHaveAttribute('aria-valuenow', '66')
  })

  it('renders the upload notice', () => {
    render(<EntryEvidenceFilesNotice />)

    expect(screen.getByRole('region', { name: 'Evidence files' })).toBeInTheDocument()
    expect(screen.getByText('File upload is not available yet')).toBeInTheDocument()
  })
})
