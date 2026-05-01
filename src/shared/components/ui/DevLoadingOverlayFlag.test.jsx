import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import DevLoadingOverlayFlag, { hasLoadingOverlayFlag } from './DevLoadingOverlayFlag'

const setUrl = (search = '') => {
  window.history.pushState({}, '', `/${search}`)
}

afterEach(() => {
  setUrl()
})

describe('DevLoadingOverlayFlag', () => {
  it('keeps children when the URL flag is absent', () => {
    render(<DevLoadingOverlayFlag><div>normal app</div></DevLoadingOverlayFlag>)

    expect(screen.getByText('normal app')).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Loading' })).not.toBeInTheDocument()
  })

  it('shows the loading overlay permanently when the URL flag is enabled', async () => {
    setUrl('?loadingOverlay=true')

    render(<DevLoadingOverlayFlag><div>normal app</div></DevLoadingOverlayFlag>)

    await waitFor(() => expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument())
    expect(screen.queryByText('normal app')).not.toBeInTheDocument()
  })

  it('accepts explicit truthy flag values only', () => {
    expect(hasLoadingOverlayFlag('?loadingOverlay=1')).toBe(true)
    expect(hasLoadingOverlayFlag('?loadingOverlay=on')).toBe(true)
    expect(hasLoadingOverlayFlag('?loadingOverlay=false')).toBe(false)
  })
})
