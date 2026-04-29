'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiJson, jsonRequest } from '@shared/utils/api'
import { useTrackedTimeout } from '@shared/hooks/useTrackedTimeout'
import { useSixDigitCode } from '@mfa/hooks/useSixDigitCode'

type TotpSetupData = { secret?: string; uri?: string }
type UseTotpSetupOptions = { enabled?: boolean; onVerified?: () => void; onVerifiedDelayMs?: number }

export function useTotpSetup({ enabled = true, onVerified, onVerifiedDelayMs = 0 }: UseTotpSetupOptions = {}) {
  const [copied, setCopied] = useState(false)
  const inputRefs = useRef<HTMLInputElement[]>([])
  const scheduleTimeout = useTrackedTimeout()
  const totpCode = useSixDigitCode({ inputRefs, scheduleTimeout })

  const setupQuery = useQuery<TotpSetupData>({
    queryKey: ['auth', 'totp-setup'],
    queryFn: () => apiJson('/api/auth/totp/setup', {}, { retryOnUnauthorized: false }),
    enabled,
    retry: false,
  })

  const secret = typeof setupQuery.data?.secret === 'string' ? setupQuery.data.secret : ''
  const uri = typeof setupQuery.data?.uri === 'string' ? setupQuery.data.uri : ''
  const loadError = setupQuery.isError || Boolean(setupQuery.data && !secret)

  const verifyMutation = useMutation({
    mutationFn: (digits: string[]) => {
      if (!secret) throw new Error('Missing secret')
      return apiJson('/api/auth/totp/setup', jsonRequest({
        code: digits.join(''),
        secret,
      }, { method: 'POST' }), { retryOnUnauthorized: false })
    },
  })

  const verifyTotp = useCallback(async (digits: string[]) => {
    if (!secret) return
    totpCode.setState('checking')

    try {
      await verifyMutation.mutateAsync(digits)
      totpCode.setState('done')
      if (!onVerified) return
      if (onVerifiedDelayMs > 0) {
        scheduleTimeout(onVerified, onVerifiedDelayMs)
        return
      }
      onVerified()
    } catch {
      totpCode.setError()
    }
  }, [onVerified, onVerifiedDelayMs, scheduleTimeout, secret, totpCode, verifyMutation])

  const submitCode = useCallback(() => {
    if (totpCode.state !== 'idle') return
    if (!totpCode.digits.every(Boolean)) return
    void verifyTotp(totpCode.digits)
  }, [totpCode.digits, totpCode.state, verifyTotp])

  useEffect(() => {
    if (!enabled) return
    if (totpCode.state !== 'idle') return
    if (!totpCode.digits.every(Boolean)) return
    void verifyTotp(totpCode.digits)
  }, [enabled, totpCode.digits, totpCode.state, verifyTotp])

  const copySecret = useCallback(() => {
    if (!secret) return
    navigator.clipboard?.writeText(secret).catch(() => {})
    setCopied(true)
    scheduleTimeout(() => setCopied(false), 2000)
  }, [scheduleTimeout, secret])

  return {
    copied,
    copySecret,
    inputRefs,
    loadError,
    loading: setupQuery.isPending,
    retry: () => setupQuery.refetch(),
    secret,
    secretDisplay: secret.match(/.{1,4}/g)?.join(' ') ?? secret,
    submitCode,
    totpCode,
    uri,
  }
}
