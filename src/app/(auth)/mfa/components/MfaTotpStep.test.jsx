import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MfaTotpStep from './MfaTotpStep'

vi.mock('./TotpSecretBlock', () => ({
  default: ({ secret, onCopy }) => <button type="button" onClick={onCopy}>secret:{secret}</button>,
}))

vi.mock('./DigitRow', () => ({
  default: () => <div>digit row</div>,
}))

describe('MfaTotpStep', () => {
  it('shows setup content while totp is pending', () => {
    render(
      <MfaTotpStep
        copied={false}
        onCopySecret={vi.fn()}
        onContinue={vi.fn()}
        totp={['', '', '', '', '', '']}
        totpDone={false}
        totpLoading={false}
        totpRefs={{ current: [] }}
        totpSecretDisp="ABCD EFGH"
        totpState="idle"
        totpUri="otpauth://totp/clausule"
        onChange={vi.fn()}
        onKeyDown={vi.fn()}
        onPaste={vi.fn()}
      />
    )

    expect(screen.getByText('Authenticator app')).toBeInTheDocument()
    expect(screen.getByText('digit row')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /secret:abcd efgh/i })).toBeInTheDocument()
  })

  it('shows the continue action once totp is done', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()

    render(
      <MfaTotpStep
        copied={false}
        onCopySecret={vi.fn()}
        onContinue={onContinue}
        totp={['', '', '', '', '', '']}
        totpDone
        totpLoading={false}
        totpRefs={{ current: [] }}
        totpSecretDisp="ABCD EFGH"
        totpState="done"
        totpUri="otpauth://totp/clausule"
        onChange={vi.fn()}
        onKeyDown={vi.fn()}
        onPaste={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(onContinue).toHaveBeenCalledTimes(1)
  })
})
