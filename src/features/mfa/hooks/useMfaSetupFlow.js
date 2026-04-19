'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch, jsonRequest } from '@shared/utils/api'
import { useCountdown } from '@shared/hooks/useCountdown'
import { useTrackedTimeout } from '@shared/hooks/useTrackedTimeout'
import { ROUTES } from '@shared/utils/routes'
import { storage } from '@shared/utils/storage'
import { useSixDigitCode } from '@features/mfa/hooks/useSixDigitCode'

export function useMfaSetupFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('your email')
  const [hasMfaSetup, setHasMfaSetup] = useState(false)
  const [resendTimer, , resetResendTimer] = useCountdown(30)

  const [totpSecret, setTotpSecret] = useState('')
  const [totpUri, setTotpUri] = useState('')
  const [totpSecretDisp, setTotpSecretDisp] = useState('')
  const [totpLoading, setTotpLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const otpRefs = useRef([])
  const totpRefs = useRef([])
  const scheduleTimeout = useTrackedTimeout()
  const otpCode = useSixDigitCode({ inputRefs: otpRefs, scheduleTimeout })
  const totpCode = useSixDigitCode({ inputRefs: totpRefs, scheduleTimeout })

  useEffect(() => {
    setEmail(storage.getEmail() || 'your email')
    setHasMfaSetup(storage.getMfaSetup())
  }, [])

  useEffect(() => {
    if (step !== 2 || totpSecret) return
    setTotpLoading(true)
    apiFetch('/api/auth/totp/setup')
      .then((response) => response.json())
      .then(({ secret, uri }) => {
        if (!secret) return
        setTotpSecret(secret)
        setTotpUri(uri)
        setTotpSecretDisp(secret.match(/.{1,4}/g)?.join(' ') ?? secret)
      })
      .catch(() => {})
      .finally(() => setTotpLoading(false))
  }, [step, totpSecret])

  const verifyOtp = useCallback(async (digits) => {
    const code = digits.join('')
    otpCode.setState('checking')
    try {
      const res = await fetch('/api/auth/verify-code', jsonRequest({ email, code }, { method: 'POST' }))
      if (!res.ok) {
        otpCode.setError()
        return
      }

      otpCode.setState('done')
      if (hasMfaSetup) scheduleTimeout(() => router.replace(ROUTES.brag), 500)
      else scheduleTimeout(() => setStep(2), 500)
    } catch {
      otpCode.setError()
    }
  }, [email, hasMfaSetup, otpCode, router, scheduleTimeout])

  const verifyTotp = useCallback(async (digits) => {
    const code = digits.join('')
    if (!totpSecret) return

    totpCode.setState('checking')
    try {
      const res = await apiFetch('/api/auth/totp/setup', jsonRequest({ code, secret: totpSecret }, { method: 'POST' }))
      if (res.ok) totpCode.setState('done')
      else totpCode.setError()
    } catch {
      totpCode.setError()
    }
  }, [totpCode, totpSecret])

  useEffect(() => {
    if (otpCode.state === 'idle' && otpCode.digits.every(Boolean)) verifyOtp(otpCode.digits)
  }, [otpCode.digits, otpCode.state, verifyOtp])

  useEffect(() => {
    if (step !== 2) return
    if (totpCode.state === 'idle' && totpCode.digits.every(Boolean)) verifyTotp(totpCode.digits)
  }, [step, totpCode.digits, totpCode.state, verifyTotp])

  const copySecret = useCallback(() => {
    navigator.clipboard?.writeText(totpSecret).catch(() => {})
    setCopied(true)
    scheduleTimeout(() => setCopied(false), 2000)
  }, [scheduleTimeout, totpSecret])

  const finishSetup = useCallback(() => {
    storage.setMfaSetup(true)
    setHasMfaSetup(true)
    setStep(3)
  }, [])

  const enterApp = useCallback(() => router.push(ROUTES.brag), [router])

  return {
    copied,
    copySecret,
    email,
    enterApp,
    finishSetup,
    otpCode,
    otpRefs,
    resendTimer,
    resetResendTimer,
    step,
    totpCode,
    totpDone: totpCode.state === 'done',
    totpLoading,
    totpRefs,
    totpSecretDisp,
    totpUri,
  }
}
