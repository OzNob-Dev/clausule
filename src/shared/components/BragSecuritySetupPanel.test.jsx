import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@mfa/hooks/useTotpSetup', () => ({
  useTotpSetup: () => ({
    copied: false,
    copySecret: vi.fn(),
    inputRefs: { current: [] },
    loadError: false,
    loading: false,
    retry: vi.fn(),
    secretDisplay: '2YUJ Z5N2 B6YF JQAK OQMW FFRF AYKZ 77C6',
    submitCode: vi.fn(),
    totpCode: {
      digits: ['', '', '', '', '', ''],
      handleChange: vi.fn(),
      handleKeyDown: vi.fn(),
      handlePaste: vi.fn(),
      state: 'idle',
    },
    uri: '',
  }),
}))

import BragSecuritySetupPanel from './BragSecuritySetupPanel'

describe('BragSecuritySetupPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the setup controls', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(<BragSecuritySetupPanel onDone={vi.fn()} onCancel={onCancel} />)

    expect(screen.getByText(/scan the qr code with your authenticator app/i)).toBeInTheDocument()
    expect(screen.getByText('Enter 6-digit code to verify')).toBeInTheDocument()
    expect(screen.getByLabelText('Manual entry key')).toHaveTextContent('2YUJ Z5N2 B6YF JQAK OQMW FFRF AYKZ 77C6')
    expect(screen.getByRole('button', { name: 'Copy secret key' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Verify and enable' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
