import React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

const getServerAuth = vi.fn()
const listEntries = vi.fn()
const ResumeScreen = vi.fn(() => <div>Resume screen</div>)

vi.mock('@auth/server/serverSession.js', () => ({
  getServerAuth: (...args) => getServerAuth(...args),
}))

vi.mock('@brag/server/entries.js', () => ({
  listEntries: (...args) => listEntries(...args),
}))

vi.mock('@resume/ResumeScreen', () => ({
  default: (props) => ResumeScreen(props),
}))

describe('resume page', () => {
  it('loads brag entries for the resume route', async () => {
    getServerAuth.mockResolvedValueOnce({ userId: 'user-1' })
    listEntries.mockResolvedValueOnce({ status: 200, body: { entries: [{ id: 'entry-1' }] } })

    render(await Page())

    expect(listEntries).toHaveBeenCalledWith({ userId: 'user-1', searchParams: expect.any(URLSearchParams) })
    expect(ResumeScreen).toHaveBeenCalledWith(expect.objectContaining({
      initialEntries: [{ id: 'entry-1' }],
      initialEntriesError: '',
    }))
  })
})
