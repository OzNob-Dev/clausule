import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FlaggedEmployeesTable from './FlaggedEmployeesTable'

describe('FlaggedEmployeesTable', () => {
  it('renders a semantic flagged-employees table with row headers', () => {
    render(<FlaggedEmployeesTable />)

    const table = screen.getByRole('table', { name: /flagged employees requiring attention/i })
    const marcusRow = within(table).getByRole('rowheader', { name: /marcus o'brien/i })

    expect(within(table).getByRole('columnheader', { name: /employee/i })).toBeInTheDocument()
    expect(marcusRow).toBeInTheDocument()
    expect(within(table).getByText(/4 conduct notes \+ 2 escalations in 60d/i)).toBeInTheDocument()
  })
})
