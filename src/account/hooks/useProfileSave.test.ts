import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProfileSave } from './useProfileSave'

const refresh = vi.fn()
const updateUser = vi.fn()
const setProfile = vi.fn()
const setQueryData = vi.fn()
const invalidateQueries = vi.fn()
const saveProfileAction = vi.fn()
const apiFetch = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

vi.mock('@auth/context/AuthContext', () => ({
  useAuth: () => ({ updateUser }),
}))

vi.mock('@auth/store/useProfileStore', () => ({
  useProfileStore: (selector: (state: { setProfile: typeof setProfile }) => unknown) => selector({ setProfile }),
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(({ mutationFn }: { mutationFn: (...args: any[]) => any }) => ({ mutateAsync: mutationFn, isPending: false })),
  useQueryClient: () => ({ setQueryData, invalidateQueries }),
}))

vi.mock('@shared/utils/api', () => ({
  apiFetch: (...args: unknown[]) => apiFetch(...args),
}))

vi.mock('@actions/account-actions', () => ({
  saveProfileAction: (...args: unknown[]) => saveProfileAction(...args),
}))

describe('useProfileSave', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
  })

  it('persists the profile and refreshes dependent state', async () => {
    const commitBaseline = vi.fn()
    saveProfileAction.mockResolvedValue({
      ok: true,
      user: { id: 'user-1', email: 'new@example.com', role: 'employee' },
      profile: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'new@example.com',
        mobile: '+123',
        jobTitle: 'Engineer',
        department: 'Platform',
      },
    })

    const { result } = renderHook(() =>
      useProfileSave({
        current: {
          firstName: 'Ada',
          lastName: 'Lovelace',
          email: 'ada@example.com',
          mobile: '+123',
          jobTitle: 'Engineer',
          department: 'Platform',
        },
        emailChanged: true,
        commitBaseline,
      })
    )

    const nextProfile = await act(async () =>
      result.current.patchProfile({
        emailVerificationCode: '123456',
        mobileConfirmed: true,
        mobileConfirmation: '+123',
      })
    )

    expect(nextProfile).toMatchObject({ email: 'new@example.com' })
    expect(saveProfileAction).toHaveBeenCalledWith(expect.objectContaining({
      email: 'ada@example.com',
      emailVerificationCode: '123456',
      mobileConfirmed: true,
      mobileConfirmation: '+123',
    }), expect.any(Object))
    await waitFor(() => expect(setProfile).toHaveBeenCalledWith(expect.objectContaining({ email: 'new@example.com' })))
    expect(setQueryData).toHaveBeenCalledWith(['profile'], expect.objectContaining({ email: 'new@example.com' }))
    expect(updateUser).toHaveBeenCalledWith({ email: 'new@example.com' })
    expect(commitBaseline).toHaveBeenCalledWith(expect.objectContaining({ email: 'new@example.com' }))
    expect(apiFetch).toHaveBeenCalledWith('/api/auth/refresh', { method: 'POST' }, { retryOnUnauthorized: false })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['profile'] })
    expect(refresh).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(result.current.success).toBe('Profile saved'))
  })

  it('surfaces save errors without refreshing', async () => {
    saveProfileAction.mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() =>
      useProfileSave({
        current: {
          firstName: 'Ada',
          lastName: 'Lovelace',
          email: 'ada@example.com',
          mobile: '+123',
          jobTitle: 'Engineer',
          department: 'Platform',
        },
        emailChanged: false,
        commitBaseline: vi.fn(),
      })
    )

    await act(async () => {
      await result.current.patchProfile({})
    })
    await waitFor(() => expect(result.current.error).toBe('boom'))
    expect(apiFetch).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })
})
