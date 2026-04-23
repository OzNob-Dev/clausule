'use client'

import { useState } from 'react'
import SsoProviderIcon from '@shared/components/SsoProviderIcon'
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
  const [nameError, setNameError] = useState(false)
  const [agreedError, setAgreedError] = useState(false)
  const activeSsoProviders = hideSso ? [] : getActiveSsoProviders(ssoConfigFromEnv)
  const hasSso = activeSsoProviders.length > 0

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
          onChange={(event) => {
            if (emailLocked) return
            setEmail(event.target.value)
            setEmailDirty(true)
          }}
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
              {emailLocked ? 'Email carried over from sign in.' : "We'll send a verification code here each time you sign in."}
            </span>
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
