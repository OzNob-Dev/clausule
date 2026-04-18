'use client'

import { useState } from 'react'
import { validateEmail } from '@/utils/emailValidation'
import { CtaBtn } from './SignupButtons'
import { FieldInput, FieldLabel } from './SignupFormField'
import { ArrowIcon } from './SignupIcons'

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
      <div className="su-step-sub">Your brag doc, your file. Takes about 2 minutes.</div>

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
