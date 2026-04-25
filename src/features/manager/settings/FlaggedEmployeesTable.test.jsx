import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FlaggedEmployeesTable from './FlaggedEmployeesTable'

describe('FlaggedEmployeesTable', () => {
  it('renders an honest placeholder instead of fixture-backed risk rows', () => {
    render(<FlaggedEmployeesTable />)

    const status = screen.getByRole('status')

    expect(within(status).getByText(/flagged employee records will appear here/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
