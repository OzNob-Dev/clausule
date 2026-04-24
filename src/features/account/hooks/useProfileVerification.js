import { useEffect, useState } from 'react'
import { apiFetch, jsonRequest } from '@shared/utils/api'

export function useProfileVerification({ current, emailChanged, mobileChanged, patchProfile, setError }) {
  const [confirmOpen,    setConfirmOpen]    = useState(false)
  const [emailCode,      setEmailCode]      = useState('')
  const [emailCodeState, setEmailCodeState] = useState('idle')
  const [mobileCheck,    setMobileCheck]    = useState('')
  const [mobileAck,      setMobileAck]      = useState(false)

  const resetVerification = () => {
    setConfirmOpen(false)
    setEmailCode('')
    setEmailCodeState('idle')
    setMobileCheck('')
    setMobileAck(false)
  }

  useEffect(() => {
    if (!confirmOpen || !emailChanged || emailCodeState !== 'idle') return
    let active = true
    setEmailCodeState('sending')
    apiFetch('/api/auth/send-code', jsonRequest({ email: current.email }, { method: 'POST' }))
      .then(async (res) => {
        if (!active) return
        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          throw new Error(d.error || 'Failed to send verification code')
        }
        setEmailCodeState('sent')
      })
      .catch((err) => {
        if (!active) return
        setEmailCodeState('error')
        setError(err.message || 'Failed to send verification code')
      })
    return () => { active = false }
  }, [confirmOpen, current.email, emailChanged, emailCodeState, setError])

  const verificationReady = !emailChanged  || (emailCodeState === 'sent' && emailCode.trim().length === 6)
  const mobileReady       = !mobileChanged || (mobileCheck.trim() === current.mobile && mobileAck)
  const finalReady        = verificationReady && mobileReady

  const openConfirm = () => {
    setError('')
    setConfirmOpen(true)
  }

  const submitConfirm = () => {
    if (emailChanged && emailCode.trim().length !== 6) {
      setError('Enter the 6-digit code we sent to the new email.')
      return
    }
    if (mobileChanged && !mobileReady) {
      setError('Confirm the new mobile number before saving.')
      return
    }
    void patchProfile({
      emailVerificationCode: emailChanged ? emailCode.trim() : '',
      mobileConfirmed:       !mobileChanged || mobileReady,
      mobileConfirmation:    mobileCheck.trim(),
    })
  }

  return {
    confirmOpen, openConfirm, resetVerification,
    emailCode, setEmailCode, emailCodeState,
    mobileCheck, setMobileCheck,
    mobileAck, setMobileAck,
    verificationReady, mobileReady, finalReady,
    submitConfirm,
  }
}
