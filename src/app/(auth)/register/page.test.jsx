import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((value) => {
    throw new Error(`redirect:${value}`)
  }),
}))

vi.mock('next/navigation', () => ({
  redirect,
}))

describe('register page', () => {
  it('redirects register traffic to the canonical signup route', async () => {
    expect(() => Page()).toThrow('redirect:/signup')
    expect(redirect).toHaveBeenCalledWith('/signup')
  })
})
