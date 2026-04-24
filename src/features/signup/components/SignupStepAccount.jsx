'use client'

import { useEffect, useState } from 'react'
import SsoProviderIcon from '@shared/components/SsoProviderIcon'
import { jsonRequest } from '@shared/utils/api'
import { validateEmail } from '@shared/utils/emailValidation'
import { getActiveSsoProviders, ssoAuthPath, ssoConfigFromEnv } from '@shared/utils/sso'
import { CtaBtn } from './SignupButtons'
import { FieldInput, FieldLabel } from './SignupFormField'
import { ArrowIcon } from './SignupIcons'

function SsoArrow() {
  return (
    <span className="su-sso-arrow">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="6 4 10 8 6 12"/></svg>
    </span>
  )
}

export default function SignupStepAccount({ emailLocked = false, hideSso = false, initialData, onNext }) {
  const [firstName, setFirstName] = useState(initialData.firstName)
  const [lastName, setLastName] = useState(initialData.lastName)
  const [email, setEmail] = useState(initialData.email)
  const [emailDirty, setEmailDirty] = useState(false)
  const [agreed, setAgreed] = useState(initialData.agreed)
  const [emailVerificationToken, setEmailVerificationToken] = useState(initialData.emailVerificationToken ?? '')
  const [verificationCode, setVerificationCode] = useState('')
  const [awaitingVerification, setAwaitingVerification] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [nameError, setNameError] = useState(false)
  const [agreedError, setAgreedError] = useState(false)
  const activeSsoProviders = hideSso ? [] : getActiveSsoProviders(ssoConfigFromEnv)
  const hasSso = activeSsoProviders.length > 0

  useEffect(() => {
    setFirstName(initialData.firstName)
    setLastName(initialData.lastName)
    setEmail(initialData.email)
    setAgreed(initialData.agreed)
    setEmailVerificationToken(initialData.emailVerificationToken ?? '')
    setVerificationCode('')
    setAwaitingVerification(false)
    setVerificationError('')
    setEmailDirty(false)
    setNameError(false)
    setAgreedError(false)
  }, [initialData])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const normalizedEmail = (initialData.email ?? '').trim().toLowerCase()
    if (!normalizedEmail) return
    const stored = window.sessionStorage.getItem(`signup_verification:${normalizedEmail}`)
    if (!stored) return
    setEmailVerificationToken(stored)
    setAwaitingVerification(false)
    setVerificationError('')
  }, [initialData.email])

  const emailResult = validateEmail(email)
  const showEmailFeedback = emailDirty && email.trim().length > 0
  const normalizedEmail = (emailResult.suggestion ?? email.trim()).toLowerCase()

  const acceptSuggestion = () => {
    setEmail(emailResult.suggestion)
    setEmailDirty(false)
  }

  async function sendVerificationCode() {
    setSendingCode(true)
    setVerificationError('')
    try {
      const response = await fetch('/api/auth/send-code', jsonRequest({ email: normalizedEmail }, { method: 'POST' }))
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        setVerificationError(json.error ?? 'Failed to send verification code')
        return false
      }
      setAwaitingVerification(true)
      return true
    } catch {
      setVerificationError('Failed to send verification code')
      return false
    } finally {
      setSendingCode(false)
    }
  }

  async function verifyEmail() {
    setVerifyingCode(true)
    setVerificationError('')
    try {
      const response = await fetch('/api/auth/signup/verify-email', jsonRequest({
        email: normalizedEmail,
        code: verificationCode,
      }, { method: 'POST' }))
      const json = await response.json().catch(() => ({}))
      if (!response.ok || !json.verificationToken) {
        setVerificationError(json.error ?? 'Failed to verify email')
        return null
      }
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(`signup_verification:${normalizedEmail}`, json.verificationToken)
      }
      setEmailVerificationToken(json.verificationToken)
      setAwaitingVerification(false)
      return json.verificationToken
    } catch {
      setVerificationError('Failed to verify email')
      return null
    } finally {
      setVerifyingCode(false)
    }
  }

  const handleContinue = async () => {
    const noName = !firstName.trim()
    const badEmail = !emailResult.valid && !emailResult.suggestion
    const noAgreed = !agreed

    setNameError(noName)
    setAgreedError(noAgreed)
    setEmailDirty(true)

    if (noName || badEmail || noAgreed) return

    let token = emailVerificationToken
    if (!token) {
      const sent = awaitingVerification ? true : await sendVerificationCode()
      if (!sent) return
      if (verificationCode.length !== 6) {
        setVerificationError('Enter the 6-digit code we sent to your email')
        return
      }
      token = await verifyEmail()
      if (!token) return
    }

    onNext({
      firstName,
      lastName,
      email: emailResult.suggestion ?? email.trim(),
      emailVerificationToken: token,
    })
  }

  const isVerified = Boolean(emailVerificationToken)

  const handleEmailChange = (event) => {
    if (emailLocked) return
    const nextEmail = event.target.value
    setEmail(nextEmail)
    setEmailDirty(true)
    setEmailVerificationToken('')
    setVerificationCode('')
    setAwaitingVerification(false)
    setVerificationError('')
    if (typeof window !== 'undefined') {
      const current = normalizedEmail
      if (current) window.sessionStorage.removeItem(`signup_verification:${current}`)
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
            <button key={provider.id} type="button" className="su-sso-provider" onClick={() => { window.location.href = ssoAuthPath(provider.id) }}>
              <span className="su-sso-logo">
                <SsoProviderIcon provider={provider.id} />
              </span>
              <span className="su-sso-label">{provider.ctaLabel}</span>
              <SsoArrow />
            </button>
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
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value)
              setNameError(false)
            }}
            error={nameError}
          />
        </div>
        <div className="su-name-col">
          <FieldLabel htmlFor="su-last-name">Last name</FieldLabel>
          <FieldInput
            id="su-last-name"
            type="text"
            placeholder="Ellis"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>
      </div>

      <div className="su-field">
        <FieldLabel htmlFor="su-email">Email</FieldLabel>
        <FieldInput
          id="su-email"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={handleEmailChange}
          onBlur={() => setEmailDirty(true)}
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

      {!isVerified && awaitingVerification && (
        <div className="su-field">
          <FieldLabel htmlFor="su-email-verification-code">Verification code</FieldLabel>
          <FieldInput
            id="su-email-verification-code"
            type="text"
            inputMode="numeric"
            placeholder="123456"
            maxLength={6}
            value={verificationCode}
            onChange={(event) => {
              setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))
              setVerificationError('')
            }}
          />
          <div id="su-email-verification-hint">
            {verificationError ? (
              <span className="su-field-hint su-field-hint--error" role="alert">{verificationError}</span>
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
            checked={agreed}
            onChange={(event) => {
              setAgreed(event.target.checked)
              setAgreedError(false)
            }}
          />
          I agree to Clausule's <a href="#">Terms of Service</a>{' '}and <a href="#">Privacy Policy</a>
        </label>
        {agreedError && <div className="su-terms-error">Please agree to continue.</div>}
      </div>

      <CtaBtn onClick={handleContinue} disabled={sendingCode || verifyingCode}>
        {sendingCode ? 'Sending code…' : verifyingCode ? 'Verifying…' : isVerified ? <>Continue to payment <ArrowIcon /></> : awaitingVerification ? 'Verify email to continue' : 'Send verification code'}
      </CtaBtn>
    </div>
  )
}
