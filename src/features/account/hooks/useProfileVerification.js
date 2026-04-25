import { useCallback, useReducer } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiJson, jsonRequest } from '@shared/utils/api'

const INITIAL_STATE = {
  confirmOpen: false,
  emailCode: '',
  emailCodeState: 'idle',
  mobileCheck: '',
  mobileAck: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'open_confirm':
      return { ...state, confirmOpen: true }
    case 'reset':
      return INITIAL_STATE
    case 'set_email_code':
      return { ...state, emailCode: action.value }
    case 'set_email_code_state':
      return { ...state, emailCodeState: action.value }
    case 'set_mobile_check':
      return { ...state, mobileCheck: action.value }
    case 'set_mobile_ack':
      return { ...state, mobileAck: action.value }
    default:
      return state
  }
}

export function useProfileVerification({ current, emailChanged, mobileChanged, patchProfile, setError }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const sendCodeMutation = useMutation({
    mutationFn: (email) => apiJson('/api/auth/send-code', jsonRequest({ email }, { method: 'POST' }), { retryOnUnauthorized: false }),
    retry: false,
  })

  const sendEmailCode = useCallback(async () => {
    dispatch({ type: 'set_email_code_state', value: 'sending' })
    try {
      await sendCodeMutation.mutateAsync(current.email)
      dispatch({ type: 'set_email_code_state', value: 'sent' })
    } catch (err) {
      dispatch({ type: 'set_email_code_state', value: 'error' })
      setError(err instanceof Error && err.message ? err.message : 'Failed to send verification code')
    }
  }, [current.email, sendCodeMutation, setError])

  const resetVerification = useCallback(() => {
    dispatch({ type: 'reset' })
  }, [])

  const verificationReady = !emailChanged  || (state.emailCodeState === 'sent' && state.emailCode.trim().length === 6)
  const mobileReady       = !mobileChanged || (state.mobileCheck.trim() === current.mobile && state.mobileAck)
  const finalReady        = verificationReady && mobileReady

  const openConfirm = useCallback(() => {
    setError('')
    dispatch({ type: 'open_confirm' })
    if (emailChanged && state.emailCodeState === 'idle') void sendEmailCode()
  }, [emailChanged, sendEmailCode, setError, state.emailCodeState])

  const submitConfirm = () => {
    if (emailChanged && state.emailCode.trim().length !== 6) {
      setError('Enter the 6-digit code we sent to the new email.')
      return
    }
    if (mobileChanged && !mobileReady) {
      setError('Confirm the new mobile number before saving.')
      return
    }
    void patchProfile({
      emailVerificationCode: emailChanged ? state.emailCode.trim() : '',
      mobileConfirmed:       !mobileChanged || mobileReady,
      mobileConfirmation:    state.mobileCheck.trim(),
    })
  }

  return {
    confirmOpen: state.confirmOpen,
    openConfirm,
    resetVerification,
    emailCode: state.emailCode,
    setEmailCode: (value) => dispatch({ type: 'set_email_code', value }),
    emailCodeState: state.emailCodeState,
    mobileCheck: state.mobileCheck,
    setMobileCheck: (value) => dispatch({ type: 'set_mobile_check', value }),
    mobileAck: state.mobileAck,
    setMobileAck: (value) => dispatch({ type: 'set_mobile_ack', value }),
    verificationReady, mobileReady, finalReady,
    submitConfirm,
  }
}
