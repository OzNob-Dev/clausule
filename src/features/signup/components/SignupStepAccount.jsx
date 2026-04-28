'use client'

import { useReducer } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiJson, jsonRequest } from '@shared/utils/api'
import { validateEmail } from '@shared/utils/emailValidation'
import { getActiveSsoProviders, ssoConfigFromEnv } from '@shared/utils/sso'
import { SsoProviderButton } from '@shared/components/ui/SsoProviderButton'
import { ROUTES } from '@shared/utils/routes'
import { CtaBtn } from '@shared/components/ui/SignupButtons'
import { Field, FieldCheckbox, FieldInput, FieldLabel } from '@shared/components/ui/Field'
import { Button } from '@shared/components/ui/Button'
import { ArrowIcon } from '@shared/components/ui/SignupIcons'
import { Link } from '@shared/components/ui/Link'

function createState(initialData) {
  return {
    firstName: initialData.firstName ?? '',
    lastName: initialData.lastName ?? '',
    email: initialData.email ?? '',
    emailDirty: false,
    agreed: Boolean(initialData.agreed),
    nameError: false,
    agreedError: false,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'set_first_name':
      return { ...state, firstName: action.value, nameError: false }
    case 'set_last_name':
      return { ...state, lastName: action.value }
    case 'set_email':
      return {
        ...state,
        email: action.value,
        emailDirty: true,
      }
    case 'accept_suggestion':
      return {
        ...state,
        email: action.value,
        emailDirty: false,
      }
    case 'set_email_dirty':
      return { ...state, emailDirty: action.value }
    case 'set_agreed':
      return { ...state, agreed: action.value, agreedError: false }
    case 'show_validation':
      return { ...state, nameError: action.nameError, agreedError: action.agreedError, emailDirty: true }
    default:
      return state
  }
}

export default function SignupStepAccount({ emailLocked = false, hideSso = false, initialData, onNext }) {
  const [state, dispatch] = useReducer(reducer, initialData, createState)
  const activeSsoProviders = hideSso ? [] : getActiveSsoProviders(ssoConfigFromEnv)
  const hasSso = activeSsoProviders.length > 0

  const emailResult = validateEmail(state.email)
  const showEmailFeedback = state.emailDirty && state.email.trim().length > 0

  const acceptSuggestion = () => {
    dispatch({ type: 'accept_suggestion', value: emailResult.suggestion })
  }

  const handleContinue = () => {
    const noName = !state.firstName.trim()
    const badEmail = !emailResult.valid && !emailResult.suggestion
    const noAgreed = !state.agreed

    dispatch({ type: 'show_validation', nameError: noName, agreedError: noAgreed })

    if (noName || badEmail || noAgreed) return

    onNext({
      firstName: state.firstName,
      lastName: state.lastName,
      email: emailResult.suggestion ?? state.email.trim(),
    })
  }

  const handleEmailChange = (event) => {
    if (emailLocked) return
    const nextEmail = event.target.value
    dispatch({ type: 'set_email', value: nextEmail })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    void handleContinue()
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
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
        <Field className="su-name-col">
          <FieldLabel htmlFor="su-first-name">First name</FieldLabel>
          <FieldInput
            id="su-first-name"
            type="text"
            placeholder="Jordan"
            value={state.firstName}
            onChange={(event) => dispatch({ type: 'set_first_name', value: event.target.value })}
            error={state.nameError}
          />
        </Field>
        <Field className="su-name-col">
          <FieldLabel htmlFor="su-last-name">Last name</FieldLabel>
          <FieldInput
            id="su-last-name"
            type="text"
            placeholder="Ellis"
            value={state.lastName}
            onChange={(event) => dispatch({ type: 'set_last_name', value: event.target.value })}
          />
        </Field>
      </div>

      <Field className="su-field">
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
          aria-invalid={showEmailFeedback && !emailResult.valid && !emailResult.suggestion}
          aria-describedby="su-email-hint"
        />
        <div id="su-email-hint">
          {showEmailFeedback && emailResult.error ? (
            <span className="su-field-hint su-field-hint--error" role="alert">{emailResult.error}</span>
          ) : showEmailFeedback && emailResult.suggestion ? (
              <span className="su-field-hint su-field-hint--suggest" role="alert">
              Did you mean{' '}
              <Button type="button" variant="ghost" size="sm" className="su-suggest-btn" onClick={acceptSuggestion}>
                {emailResult.suggestion}
              </Button>
              ?
            </span>
          ) : (
            <span className="su-field-hint">
              {emailLocked ? 'Email carried over from sign in.' : 'We will verify this email before creating your account.'}
            </span>
          )}
        </div>
      </Field>


      <div className="su-terms">
        <label className="su-terms-label">
          <FieldCheckbox
            checked={state.agreed}
            onChange={(event) => {
              dispatch({ type: 'set_agreed', value: event.target.checked })
            }}
          />
          <span>
            I agree to Clausule&apos;s <Link href={ROUTES.terms}>Terms of Service</Link>{' '}and <Link href={ROUTES.privacy}>Privacy Policy</Link>
          </span>
        </label>
        {state.agreedError && <div className="su-terms-error">Please agree to continue.</div>}
      </div>

      <CtaBtn type="submit">
        <>Continue to payment <ArrowIcon /></>
      </CtaBtn>
    </form>
  )
}
