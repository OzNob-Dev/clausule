import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTotpSetup } from './useTotpSetup'

const writeText = vi.fn(() => Promise.resolve())
const scheduleTimeout = vi.fn()
const mutateAsync = vi.fn(async () => ({}))

vi.mock('@shared/hooks/useTrackedTimeout', () => ({
  useTrackedTimeout: () => scheduleTimeout,
}))

vi.mock('@mfa/hooks/useSixDigitCode', () => ({
  useSixDigitCode: () => ({
    digits: ['1', '2', '3', '4', '5', '6'],
    state: 'idle',
    reset: vi.fn(),
    setState: vi.fn(),
    setError: vi.fn(),
    handleChange: vi.fn(),
    handleKeyDown: vi.fn(),
    handlePaste: vi.fn(),
  }),
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(({ mutationFn }: { mutationFn: (...args: any[]) => any }) => ({ mutateAsync: vi.fn((...args: unknown[]) => mutationFn(...args)), isPending: false })),
  useQuery: () => ({
    data: { secret: 'ABCD1234', uri: 'otpauth://totp/clausule' },
    isError: false,
    isPending: false,
    refetch: vi.fn(),
  }),
}))

vi.mock('@shared/utils/api', () => ({
  apiJson: vi.fn(async () => ({ ok: true })),
  jsonRequest: vi.fn((body, init) => ({ body, init })),
}))

describe('useTotpSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
  })

  it('loads the secret, verifies completed codes, and copies the secret', async () => {
    const onVerified = vi.fn()
    const { result } = renderHook(() => useTotpSetup({ onVerified }))

    expect(result.current.secret).toBe('ABCD1234')
    expect(result.current.uri).toBe('otpauth://totp/clausule')

    await waitFor(() => expect(onVerified).toHaveBeenCalledTimes(1))

    await act(async () => {
      result.current.copySecret()
    })
    expect(writeText).toHaveBeenCalledWith('ABCD1234')
    expect(scheduleTimeout).toHaveBeenCalled()
    await waitFor(() => expect(result.current.copied).toBe(true))
  })
})
