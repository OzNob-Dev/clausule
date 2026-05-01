import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'
import { ROUTES } from '@shared/utils/routes'

const redirect = vi.fn()

vi.mock('next/navigation', () => ({
  redirect: (...args) => redirect(...args),
}))

describe('settings page', () => {
  it('redirects to the brag settings route', () => {
    Page()
    expect(redirect).toHaveBeenCalledWith(ROUTES.bragSettings)
  })
})
