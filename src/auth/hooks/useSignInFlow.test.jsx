import React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSignInFlow } from './useSignInFlow.js'

const push = vi.hoisted(() => vi.fn())
const replace = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(({ mutationFn }) => ({ mutateAsync: mutationFn, isPending: false })),
}))

vi.mock('@auth/api-client/sendCodeEmail', () => ({
  sendCodeEmail: vi.fn(),
}))

vi.mock('@mfa/hooks/useSixDigitCode', () => ({
  useSixDigitCode: vi.fn(() => ({
    digits: ['1', '2', '3', '4', '5', '6'],
    state: 'idle',
    reset: vi.fn(),
    setState: vi.fn(),
    setError: vi.fn(),
  })),
}))

vi.mock('@shared/hooks/useCountdown', () => ({
  useCountdown: vi.fn(() => [600, vi.fn(), vi.fn()]),
}))

vi.mock('@shared/hooks/useTrackedTimeout', () => ({
  useTrackedTimeout: vi.fn(() => (fn) => fn()),
}))

vi.mock('@shared/utils/api', () => ({
  apiJson: vi.fn(),
  jsonRequest: vi.fn((body, init) => ({ body, init })),
}))

import { sendCodeEmail } from '@auth/api-client/sendCodeEmail'
import { apiJson } from '@shared/utils/api'

describe('useSignInFlow', () => {
  beforeEach(() => {
    push.mockClear()
    replace.mockClear()
    sendCodeEmail.mockReset()
    apiJson.mockReset()
    window.history.replaceState(null, '', '/login?sso_error=account_error')
  })

  it('hydrates the SSO error from the URL', () => {
    const { result } = renderHook(() => useSignInFlow())

    expect(result.current.ssoError).toBe('Account error — please try again or use email.')
    expect(window.location.search).toBe('')
  })

  it('submits an email and routes signup continuations', async () => {
    sendCodeEmail.mockResolvedValue({ nextStep: 'signup' })

    const { result } = renderHook(() => useSignInFlow())

    act(() => {
      result.current.handleEmailChange({ target: { value: 'Ada@Example.com' } })
    })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() })
    })

    await waitFor(() => expect(push).toHaveBeenCalledWith('/signup?email=Ada%40Example.com'))
  })
})
