'use client'

import { useState } from 'react'
import { validateEmail } from '@/utils/emailValidation'
import { CtaBtn } from './SignupButtons'
import { FieldInput, FieldLabel } from './SignupFormField'
import { ArrowIcon } from './SignupIcons'

const SSO = {
  google:    process.env.NEXT_PUBLIC_SSO_GOOGLE_ENABLED    === 'true',
  microsoft: process.env.NEXT_PUBLIC_SSO_MICROSOFT_ENABLED === 'true',
  apple:     process.env.NEXT_PUBLIC_SSO_APPLE_ENABLED     === 'true',
}
const ANY_SSO = SSO.google || SSO.microsoft || SSO.apple

function SsoArrow() {
  return (
    <span className="su-sso-arrow">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="6 4 10 8 6 12"/></svg>
    </span>
  )
}

export default function SignupStepAccount({ initialData, onNext }) {
  const [firstName, setFirstName] = useState(initialData.firstName)
  const [lastName, setLastName] = useState(initialData.lastName)
  const [email, setEmail] = useState(initialData.email)
  const [emailDirty, setEmailDirty] = useState(false)
  const [agreed, setAgreed] = useState(initialData.agreed)
  const [nameError, setNameError] = useState(false)
  const [agreedError, setAgreedError] = useState(false)

  const emailResult = validateEmail(email)
  const showEmailFeedback = emailDirty && email.trim().length > 0

  const acceptSuggestion = () => {
    setEmail(emailResult.suggestion)
    setEmailDirty(false)
  }

  const handleContinue = () => {
    const noName = !firstName.trim()
    const badEmail = !emailResult.valid && !emailResult.suggestion
    const noAgreed = !agreed

    setNameError(noName)
    setAgreedError(noAgreed)
    setEmailDirty(true)

    if (!noName && !badEmail && !noAgreed) {
      onNext({
        firstName,
        lastName,
        email: emailResult.suggestion ?? email.trim(),
      })
    }
  }

  return (
    <div>
      <div className="su-step-heading">Create your account</div>
      <div className="su-step-sub">
        {ANY_SSO ? 'Continue with your existing account — no new password needed.' : 'Your brag doc, your file. Takes about 2 minutes.'}
      </div>

      {ANY_SSO && (
        <>
          {SSO.google && (
            <button type="button" className="su-sso-provider" onClick={() => { window.location.href = '/api/auth/sso/google' }}>
              <span className="su-sso-logo">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.77h5.47a4.67 4.67 0 0 1-2.03 3.07v2.55h3.28c1.92-1.77 3.03-4.38 3.03-7.39z" fill="#4285F4"/>
                  <path d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.23-2.51c-.9.6-2.04.96-3.39.96-2.6 0-4.81-1.76-5.6-4.13H1.07v2.6A9.99 9.99 0 0 0 10 20z" fill="#34A853"/>
                  <path d="M4.4 11.89A6.01 6.01 0 0 1 4.08 10c0-.65.11-1.29.32-1.89V5.51H1.07A10 10 0 0 0 0 10c0 1.61.38 3.14 1.07 4.49l3.33-2.6z" fill="#FBBC05"/>
                  <path d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.86-2.87C14.95.99 12.7 0 10 0A9.99 9.99 0 0 0 1.07 5.51l3.33 2.6C5.19 5.74 7.4 3.98 10 3.98z" fill="#EA4335"/>
                </svg>
              </span>
              <span className="su-sso-label">Continue with Google</span>
              <SsoArrow />
            </button>
          )}

          {SSO.microsoft && (
            <button type="button" className="su-sso-provider" onClick={() => { window.location.href = '/api/auth/sso/microsoft' }}>
              <span className="su-sso-logo">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="8.5" height="8.5" fill="#F25022"/>
                  <rect x="10.5" y="1" width="8.5" height="8.5" fill="#7FBA00"/>
                  <rect x="1" y="10.5" width="8.5" height="8.5" fill="#00A4EF"/>
                  <rect x="10.5" y="10.5" width="8.5" height="8.5" fill="#FFB900"/>
                </svg>
              </span>
              <span className="su-sso-label">Continue with Microsoft</span>
              <SsoArrow />
            </button>
          )}

          {SSO.apple && (
            <button type="button" className="su-sso-provider" onClick={() => { window.location.href = '/api/auth/sso/apple' }}>
              <span className="su-sso-logo">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M13.4 1c.1 1-.3 2-1 2.8-.6.7-1.6 1.3-2.6 1.2-.1-1 .4-2 1-2.7C11.5 1.6 12.5 1.1 13.4 1zm3.4 11.4c.5 1 .7 1.5.7 1.5-.4.1-2 .8-2 2.8 0 2.2 1.9 3 1.9 3s-1.3 3.3-3.1 3.3c-.9 0-1.5-.6-2.4-.6-.9 0-1.7.6-2.4.6-1.7 0-3.8-3.1-3.8-7.1 0-3.8 2.3-5.8 4.5-5.8.9 0 1.7.6 2.3.6.6 0 1.5-.7 2.6-.7 1.1 0 2.4.6 3.1 1.9l.1-.1c-1-.6-1.7-1.7-1.7-2.9 0-1.5.9-2.7 2.2-3.3z" fill="#1A1510"/>
                </svg>
              </span>
              <span className="su-sso-label">Continue with Apple</span>
              <SsoArrow />
            </button>
          )}

          <div className="su-sso-divider">
            <div className="su-sso-divider-line" />
            <span className="su-sso-divider-text">or sign up with email</span>
            <div className="su-sso-divider-line" />
          </div>
        </>
      )}

      <div className="su-name-row">
        <div className="su-name-col">
          <FieldLabel>First name</FieldLabel>
          <FieldInput
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
          <FieldLabel>Last name</FieldLabel>
          <FieldInput
            type="text"
            placeholder="Ellis"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>
      </div>

      <div className="su-field">
        <FieldLabel>Email</FieldLabel>
        <FieldInput
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            setEmailDirty(true)
          }}
          onBlur={() => setEmailDirty(true)}
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
            <span className="su-field-hint">We'll send a verification code here each time you sign in.</span>
          )}
        </div>
      </div>

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

      <CtaBtn onClick={handleContinue}>Continue to payment <ArrowIcon /></CtaBtn>
    </div>
  )
}
