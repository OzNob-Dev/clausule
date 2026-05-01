import React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

const getServerAuth = vi.fn()
const getLatestLinkedInImport = vi.fn()
const LinkedInImportScreen = vi.fn(() => <div>LinkedIn screen</div>)

vi.mock('@auth/server/serverSession.js', () => ({
  getServerAuth: (...args) => getServerAuth(...args),
}))

vi.mock('@brag/server/linkedinImports.js', () => ({
  getLatestLinkedInImport: (...args) => getLatestLinkedInImport(...args),
}))

vi.mock('@linkedin/LinkedInImportScreen', () => ({
  default: (props) => LinkedInImportScreen(props),
}))

describe('linkedin page', () => {
  it('loads the latest import session for the linkedin route', async () => {
    getServerAuth.mockResolvedValueOnce({ userId: 'user-1' })
    getLatestLinkedInImport.mockResolvedValueOnce({ status: 200, body: { session: { id: 'session-1' } } })

    render(await Page())

    expect(getLatestLinkedInImport).toHaveBeenCalledWith({ userId: 'user-1' })
    expect(LinkedInImportScreen).toHaveBeenCalledWith(expect.objectContaining({
      initialSession: { id: 'session-1' },
      initialError: '',
    }))
  })
})
