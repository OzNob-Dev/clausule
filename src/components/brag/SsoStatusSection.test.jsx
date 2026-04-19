import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SsoStatusSection, { getActiveSsoProviders } from './SsoStatusSection'

describe('SsoStatusSection unit', () => {
  it('returns only enabled SSO providers in display order', () => {
    expect(getActiveSsoProviders({ google: true, microsoft: false, apple: true }).map((provider) => provider.id)).toEqual(['google', 'apple'])
  })

  it('returns no providers when SSO is disabled', () => {
    expect(getActiveSsoProviders({ google: false, microsoft: false, apple: false })).toEqual([])
  })
})

describe('SsoStatusSection integration', () => {
  it('renders active SSO rows for enabled providers', () => {
    render(
      <SsoStatusSection
        avatarInitials="AL"
        displayName="Ada Lovelace"
        email="ada@example.com"
        config={{ google: true, microsoft: false, apple: false }}
      />
    )

    const row = screen.getByText('Google').closest('.bss-sso-row')

    expect(screen.getByText('Single sign-on')).toBeInTheDocument()
    expect(within(row).getByText('AL')).toBeInTheDocument()
    expect(within(row).getByText('Ada Lovelace')).toBeInTheDocument()
    expect(within(row).getByText('ada@example.com')).toBeInTheDocument()
    expect(within(row).getByLabelText('Google single sign-on is active')).toHaveTextContent('Active')
    expect(screen.queryByText('Microsoft')).not.toBeInTheDocument()
  })

  it('renders nothing when no SSO provider is enabled', () => {
    const { container } = render(
      <SsoStatusSection
        avatarInitials="AL"
        displayName="Ada Lovelace"
        email="ada@example.com"
        config={{ google: false, microsoft: false, apple: false }}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })
})
