import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@shared/utils/routes'
import { useMfaSetupFlow } from './useMfaSetupFlow'

const replace = vi.fn()
const push = vi.fn()
const resetResendTimer = vi.fn()
const otpReset = vi.fn()
const otpSetState = vi.fn()
const otpSetError = vi.fn()
const sendCodeEmail = vi.fn()
const scheduleTimeout = vi.fn((fn: () => void) => fn())
const bootstrapData = {
  profile: { email: 'ada@example.com' },
  user: { email: 'ada@example.com' },
  security: { authenticatorAppConfigured: true },
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push }),
}))

vi.mock('@shared/hooks/useCountdown', () => ({
  useCountdown: vi.fn(() => [30, vi.fn(), resetResendTimer]),
}))

vi.mock('@shared/hooks/useTrackedTimeout', () => ({
  useTrackedTimeout: () => scheduleTimeout,
}))

vi.mock('@mfa/hooks/useSixDigitCode', () => ({
  useSixDigitCode: () => ({
    digits: ['', '', '', '', '', ''],
    state: 'idle',
    reset: otpReset,
    setState: otpSetState,
    setError: otpSetError,
    handleChange: vi.fn(),
    handleKeyDown: vi.fn(),
    handlePaste: vi.fn(),
  }),
}))

vi.mock('@mfa/hooks/useTotpSetup', () => ({
  useTotpSetup: () => ({
    copied: false,
    copySecret: vi.fn(),
    inputRefs: { current: [] },
    loadError: false,
    loading: false,
    retry: vi.fn(),
    secret: '',
    secretDisplay: '',
    totpCode: { digits: ['1', '2', '3', '4', '5', '6'], state: 'idle' },
    uri: '',
  }),
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(({ mutationFn }: { mutationFn: (...args: any[]) => any }) => ({ mutateAsync: vi.fn((...args: any[]) => mutationFn(...args)), isPending: false })),
  useQuery: () => ({
    data: bootstrapData,
    isError: false,
    isPending: false,
  }),
}))

vi.mock('@auth/api-client/sendCodeEmail', () => ({
  sendCodeEmail: (...args: unknown[]) => sendCodeEmail(...args),
}))

vi.mock('@shared/utils/api', () => ({
  apiFetch: vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })),
  apiJson: vi.fn(async () => ({ ok: true })),
  jsonRequest: vi.fn((body, init) => ({ body, init })),
  readJson: vi.fn(async (response: Response) => response.json()),
}))

describe('useMfaSetupFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hydrates bootstrap data and wires resend handling', async () => {
    const { result } = renderHook(() => useMfaSetupFlow())

    await waitFor(() => expect(result.current.email).toBe('ada@example.com'))
    await result.current.handleResend()

    expect(sendCodeEmail).toHaveBeenCalledWith('ada@example.com')
    expect(otpReset).toHaveBeenCalledTimes(1)
    expect(resetResendTimer).toHaveBeenCalledTimes(1)
  })
})
