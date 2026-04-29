import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import { useProfileStore } from '@auth/store/useProfileStore'

const push = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@shared/utils/api', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@shared/utils/api'

function Consumer() {
  const { user, logout } = useAuth()
  return (
    <>
      <span>{user?.email ?? 'none'}</span>
      <button type="button" onClick={() => void logout()}>Logout</button>
    </>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    useProfileStore.getState().clearProfile()
    push.mockClear()
    apiFetch.mockReset()
  })

  it('hydrates the store from the initial session and logs out best effort', async () => {
    const user = userEvent.setup()
    apiFetch.mockRejectedValueOnce(new Error('offline'))

    render(
      <AuthProvider initialSession={{ user: { id: 'user-1', email: 'ada@example.com', role: 'employee' }, profile: { firstName: 'Ada' }, security: { ssoConfigured: false } }}>
        <Consumer />
      </AuthProvider>
    )

    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Logout' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/'))
    expect(apiFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' }, { retryOnUnauthorized: false })
    expect(useProfileStore.getState().user).toBeNull()
  })
})
