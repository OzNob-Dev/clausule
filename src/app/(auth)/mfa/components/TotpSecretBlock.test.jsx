import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/dynamic', () => ({
  default: () => function MockQr() {
    return <div data-testid="qr" />
  },
}))

import TotpSecretBlock from './TotpSecretBlock'

describe('TotpSecretBlock', () => {
  it('renders the qr and copy action', async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()

    render(
      <TotpSecretBlock
        copied={false}
        copyClassName="copy"
        qrClassName="qr"
        qrSize={148}
        secret="ABCD EFGH"
        secretClassName="secret"
        secretRowClassName="row"
        uri="otpauth://totp/clausule"
        onCopy={onCopy}
      />
    )

    expect(screen.getByTestId('qr')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /copy secret key/i }))
    expect(onCopy).toHaveBeenCalledTimes(1)
  })
})
