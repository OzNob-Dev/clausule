'use client'

import { useEffect, useReducer } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiJson, jsonRequest } from '@shared/utils/api'
import { validateEmail } from '@shared/utils/emailValidation'
import { getActiveSsoProviders, ssoConfigFromEnv } from '@shared/utils/sso'
import { SsoProviderButton } from '@features/auth/components/SsoProviderButton'
import { CtaBtn } from './SignupButtons'
import { FieldInput, FieldLabel } from './SignupFormField'
import { ArrowIcon } from './SignupIcons'

function createState(initialData) {
  return {
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    email: initialData.email,
    emailDirty: false,
    agreed: initialData.agreed,
    emailVerificationToken: initialData.emailVerificationToken ?? '',
    verificationCode: '',
    awaitingVerification: false,
    verificationError: '',
    nameError: false,
    agreedError: false,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return createState(action.value)
    case 'set_first_name':
      return { ...state, firstName: action.value, nameError: false }
    case 'set_last_name':
      return { ...state, lastName: action.value }
    case 'set_email':
      return {
        ...state,
        email: action.value,
        emailDirty: true,
        emailVerificationToken: '',
        verificationCode: '',
        awaitingVerification: false,
        verificationError: '',
      }
    case 'accept_suggestion':
      return { ...state, email: action.value, emailDirty: false }
    case 'set_email_dirty':
      return { ...state, emailDirty: action.value }
    case 'set_agreed':
      return { ...state, agreed: action.value, agreedError: false }
    case 'set_verification_code':
      return { ...state, verificationCode: action.value, verificationError: '' }
    case 'show_validation':
      return { ...state, nameError: action.nameError, agreedError: action.agreedError, emailDirty: true }
    case 'awaiting_verification':
      return { ...state, awaitingVerification: true, verificationError: '' }
    case 'verification_error':
      return { ...state, verificationError: action.value }
    case 'verification_success':
      return {
        ...state,
        emailVerificationToken: action.value,
        awaitingVerification: false,
        verificationError: '',
      }
    case 'restore_verification_token':
      return {
        ...state,
        emailVerificationToken: action.value,
        awaitingVerification: false,
        verificationError: '',
      }
    default:
      return state
  }
}

export default function SignupStepAccount({ emailLocked = false, hideSso = false, initialData, onNext }) {
  const [state, dispatch] = useReducer(reducer, initialData, createState)
  const activeSsoProviders = hideSso ? [] : getActiveSsoProviders(ssoConfigFromEnv)
  const hasSso = activeSsoProviders.length > 0

  useEffect(() => {
    dispatch({ type: 'hydrate', value: initialData })
  }, [initialData])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const normalizedEmail = (initialData.email ?? '').trim().toLowerCase()
    if (!normalizedEmail) return
    const stored = window.sessionStorage.getItem(`signup_verification:${normalizedEmail}`)
    if (!stored) return
    dispatch({ type: 'restore_verification_token', value: stored })
  }, [initialData.email])

  const sendCodeMutation = useMutation({
    mutationFn: (email) => apiJson('/api/auth/send-code', jsonRequest({ email }, { method: 'POST' }), { retryOnUnauthorized: false }),
  })

  const verifyEmailMutation = useMutation({
    mutationFn: async ({ email, code }) => {
      const json = await apiJson('/api/auth/signup/verify-email', jsonRequest({ email, code }, { method: 'POST' }), { retryOnUnauthorized: false })
      if (!json.verificationToken) throw new Error('Failed to verify email')
      return json.verificationToken
    },
  })

  const emailResult = validateEmail(state.email)
  const showEmailFeedback = state.emailDirty && state.email.trim().length > 0
  const normalizedEmail = (emailResult.suggestion ?? state.email.trim()).toLowerCase()

  const acceptSuggestion = () => {
    dispatch({ type: 'accept_suggestion', value: emailResult.suggestion })
  }

  async function sendVerificationCode() {
    try {
      await sendCodeMutation.mutateAsync(normalizedEmail)
      dispatch({ type: 'awaiting_verification' })
      return true
    } catch {
      dispatch({ type: 'verification_error', value: 'Failed to send verification code' })
      return false
    }
  }

  async function verifyEmail() {
    try {
      const token = await verifyEmailMutation.mutateAsync({
        email: normalizedEmail,
        code: state.verificationCode,
      })
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(`signup_verification:${normalizedEmail}`, token)
      }
      dispatch({ type: 'verification_success', value: token })
      return token
    } catch {
      dispatch({ type: 'verification_error', value: 'Failed to verify email' })
      return null
    }
  }

  const handleContinue = async () => {
    const noName = !state.firstName.trim()
    const badEmail = !emailResult.valid && !emailResult.suggestion
    const noAgreed = !state.agreed

    dispatch({ type: 'show_validation', nameError: noName, agreedError: noAgreed })

    if (noName || badEmail || noAgreed) return

    let token = state.emailVerificationToken
    if (!token) {
      const sent = state.awaitingVerification ? true : await sendVerificationCode()
      if (!sent) return
      if (state.verificationCode.length !== 6) {
        dispatch({ type: 'verification_error', value: 'Enter the 6-digit code we sent to your email' })
        return
      }
      token = await verifyEmail()
      if (!token) return
    }

    onNext({
      firstName: state.firstName,
      lastName: state.lastName,
      email: emailResult.suggestion ?? state.email.trim(),
      emailVerificationToken: token,
    })
  }

  const isVerified = Boolean(state.emailVerificationToken)
  const sendingCode = sendCodeMutation.isPending
  const verifyingCode = verifyEmailMutation.isPending

  const handleEmailChange = (event) => {
    if (emailLocked) return
    const previousNormalizedEmail = normalizedEmail
    const nextEmail = event.target.value
    dispatch({ type: 'set_email', value: nextEmail })
    if (typeof window !== 'undefined') {
      if (previousNormalizedEmail) window.sessionStorage.removeItem(`signup_verification:${previousNormalizedEmail}`)
    }
  }

  return (
    <div>
      <div className="su-step-heading">Create your account</div>
      <div className="su-step-sub">
        {hasSso ? 'Continue with your existing account — no new password needed.' : 'Your brag doc, your file. Takes about 2 minutes.'}
      </div>

      {hasSso && (
        <>
          {activeSsoProviders.map((provider) => (
            <SsoProviderButton key={provider.id} provider={provider} />
          ))}

          <div className="su-sso-divider">
            <div className="su-sso-divider-line" />
            <span className="su-sso-divider-text">or sign up with email</span>
            <div className="su-sso-divider-line" />
          </div>
        </>
      )}

      <div className="su-name-row">
        <div className="su-name-col">
          <FieldLabel htmlFor="su-first-name">First name</FieldLabel>
          <FieldInput
            id="su-first-name"
            type="text"
            placeholder="Jordan"
            value={state.firstName}
            onChange={(event) => dispatch({ type: 'set_first_name', value: event.target.value })}
            error={state.nameError}
          />
        </div>
        <div className="su-name-col">
          <FieldLabel htmlFor="su-last-name">Last name</FieldLabel>
          <FieldInput
            id="su-last-name"
            type="text"
            placeholder="Ellis"
            value={state.lastName}
            onChange={(event) => dispatch({ type: 'set_last_name', value: event.target.value })}
          />
        </div>
      </div>

      <div className="su-field">
        <FieldLabel htmlFor="su-email">Email</FieldLabel>
        <FieldInput
          id="su-email"
          type="email"
          placeholder="you@email.com"
          value={state.email}
          onChange={handleEmailChange}
          onBlur={() => dispatch({ type: 'set_email_dirty', value: true })}
          readOnly={emailLocked}
          className={emailLocked ? 'su-input--locked' : ''}
          error={showEmailFeedback && !!emailResult.error}
          aria-invalid={showEmailFeedback && !emailResult.valid}
          aria-describedby="su-email-hint"
        />
        <div id="su-email-hint">
          {showEmailFeedback && emailResult.error ? (
            <span className="su-field-hint su-field-hint--error" role="alert">{emailResult.error}</span>
          ) : showEmailFeedback && emailResult.suggestion ? (
            <span className="su-field-hint su-field-hint--suggest" role="alert">
              Did you mean{' '}
              <button type="button" className="su-suggest-btn" onClick={acceptSuggestion}>
                {emailResult.suggestion}
              </button>
              ?
            </span>
          ) : (
            <span className="su-field-hint">
              {isVerified ? 'Email verified for this signup.' : emailLocked ? 'Email carried over from sign in.' : 'We will verify this email before creating your account.'}
            </span>
          )}
        </div>
      </div>

      {!isVerified && state.awaitingVerification && (
        <div className="su-field">
          <FieldLabel htmlFor="su-email-verification-code">Verification code</FieldLabel>
          <FieldInput
            id="su-email-verification-code"
            type="text"
            inputMode="numeric"
            placeholder="123456"
            maxLength={6}
            value={state.verificationCode}
            onChange={(event) => {
              dispatch({ type: 'set_verification_code', value: event.target.value.replace(/\D/g, '').slice(0, 6) })
            }}
          />
          <div id="su-email-verification-hint">
            {state.verificationError ? (
              <span className="su-field-hint su-field-hint--error" role="alert">{state.verificationError}</span>
            ) : (
              <span className="su-field-hint">Enter the code we sent to {normalizedEmail}.</span>
            )}
          </div>
        </div>
      )}

      <div className="su-terms">
        <label className="su-terms-label">
          <input
            type="checkbox"
            checked={state.agreed}
            onChange={(event) => {
              dispatch({ type: 'set_agreed', value: event.target.checked })
            }}
          />
          I agree to Clausule's <a href="#">Terms of Service</a>{' '}and <a href="#">Privacy Policy</a>
        </label>
        {state.agreedError && <div className="su-terms-error">Please agree to continue.</div>}
      </div>

      <CtaBtn onClick={handleContinue} disabled={sendingCode || verifyingCode}>
        {sendingCode ? 'Sending code…' : verifyingCode ? 'Verifying…' : isVerified ? <>Continue to payment <ArrowIcon /></> : state.awaitingVerification ? 'Verify email to continue' : 'Send verification code'}
      </CtaBtn>
    </div>
  )
}
