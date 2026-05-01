import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryProvider } from '../providers/QueryProvider'
import { useFeedbackThreadsQuery } from './useFeedbackThreadsQuery'
import { useProfileQuery, useTotpStatusQuery } from './useProfileQuery'
import { apiFetch } from '../utils/api'

vi.mock('../utils/api', () => ({
  apiFetch: vi.fn(),
}))

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('shared queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads the profile query successfully', async () => {
    apiFetch.mockResolvedValueOnce(new Response(JSON.stringify({ user: { id: 'user-1' } }), { status: 200 }))

    const { result } = renderHook(() => useProfileQuery(), { wrapper: wrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ user: { id: 'user-1' } })
    expect(apiFetch).toHaveBeenCalledWith('/api/auth/profile')
  })

  it('surfaces profile query failures', async () => {
    apiFetch.mockResolvedValueOnce(new Response(JSON.stringify({ error: 'nope' }), { status: 500 }))

    const { result } = renderHook(() => useProfileQuery(), { wrapper: wrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error.message).toBe('Failed to load profile')
  })

  it('does not fetch feedback threads until enabled', async () => {
    apiFetch.mockResolvedValueOnce(new Response(JSON.stringify({ feedback: [{ id: 'thread-1' }] }), { status: 200 }))

    const { result, rerender } = renderHook(({ enabled }) => useFeedbackThreadsQuery({ enabled }), {
      initialProps: { enabled: false },
      wrapper: wrapper(),
    })

    expect(apiFetch).not.toHaveBeenCalled()

    rerender({ enabled: true })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ id: 'thread-1' }])
    expect(apiFetch).toHaveBeenCalledWith('/api/feedback')
  })

  it('uses the shared QueryProvider defaults', () => {
    const { result } = renderHook(() => useQueryClient(), {
      wrapper: ({ children }) => <QueryProvider>{children}</QueryProvider>,
    })

    expect(result.current.getDefaultOptions().queries).toMatchObject({ staleTime: 60_000, retry: 1 })
  })

  it('loads TOTP status through the profile query module', async () => {
    apiFetch.mockResolvedValueOnce(new Response(JSON.stringify({ configured: true }), { status: 200 }))

    const { result } = renderHook(() => useTotpStatusQuery(), { wrapper: wrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ configured: true })
    expect(apiFetch).toHaveBeenCalledWith('/api/auth/totp/status')
  })
})
