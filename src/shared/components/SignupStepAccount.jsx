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
import { ArrowIcon } from '@shared/components/ui/icon/ArrowIcon'
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
      <div className="su-step-sub mb-6">
        {hasSso ? 'Continue with your existing account — no new password needed.' : 'Your brag doc, your file. Takes about 2 minutes.'}
      </div>

      {hasSso && (
        <>
          {activeSsoProviders.map((provider) => (
            <SsoProviderButton key={provider.id} provider={provider} />
          ))}

          <div className="su-sso-divider my-[22px] flex items-center gap-3">
            <div className="su-sso-divider-line h-px flex-1 bg-[var(--su-border-em)]" />
            <span className="su-sso-divider-text whitespace-nowrap text-[var(--cl-text-xs)] font-bold text-[var(--su-tx4)]">or sign up with email</span>
            <div className="su-sso-divider-line h-px flex-1 bg-[var(--su-border-em)]" />
          </div>
        </>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1 max-[640px]:gap-0">
        <Field className="min-w-0 flex-1">
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
        <Field className="min-w-0 flex-1">
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

      <Field className="su-field mb-6">
        <FieldLabel htmlFor="su-email">Email</FieldLabel>
        <FieldInput
          id="su-email"
          type="email"
          placeholder="you@email.com"
          value={state.email}
          onChange={handleEmailChange}
          onBlur={() => dispatch({ type: 'set_email_dirty', value: true })}
          readOnly={emailLocked}
          className={emailLocked ? 'cursor-not-allowed bg-[var(--cl-rule-dark-4)] text-[var(--su-tx3)]' : ''}
          error={showEmailFeedback && !!emailResult.error}
          aria-invalid={showEmailFeedback && !emailResult.valid && !emailResult.suggestion}
          aria-describedby="su-email-hint"
        />
        <div id="su-email-hint">
          {showEmailFeedback && emailResult.error ? (
            <span className="text-[var(--cl-text-xs)] font-medium text-[var(--cl-danger-2)]" role="alert">{emailResult.error}</span>
          ) : showEmailFeedback && emailResult.suggestion ? (
              <span className="text-[var(--cl-text-xs)] font-medium text-[var(--cl-warning)]" role="alert">
              Did you mean{' '}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="inline border-0 bg-transparent p-0 text-[var(--cl-warning)] text-[var(--cl-text-xs)] font-bold underline underline-offset-2 shadow-none hover:bg-transparent hover:text-[var(--cl-warning-2)] hover:opacity-100 hover:translate-y-0"
                onClick={acceptSuggestion}
              >
                {emailResult.suggestion}
              </Button>
              ?
            </span>
          ) : (
            <span className="text-[var(--cl-text-xs)] font-medium text-[var(--su-tx4)]">
              {emailLocked ? 'Email carried over from sign in.' : 'We will verify this email before creating your account.'}
            </span>
          )}
        </div>
      </Field>


      <div className="su-terms mb-6">
        <label className="su-terms-label flex items-start gap-3 text-[var(--cl-text-base)] leading-[1.6] text-[var(--su-tx2)]">
          <FieldCheckbox
            checked={state.agreed}
            onChange={(event) => {
              dispatch({ type: 'set_agreed', value: event.target.checked })
            }}
          />
          <span>
            I agree to Clausule&apos;s <Link href={ROUTES.terms} className="text-[var(--su-tx1)]">Terms of Service</Link>{' '}and <Link href={ROUTES.privacy} className="text-[var(--su-tx1)]">Privacy Policy</Link>
          </span>
        </label>
        {state.agreedError ? <div className="su-terms-error mt-1 text-[var(--cl-text-xs)] text-[var(--cl-danger-2)]">Please agree to continue.</div> : null}
      </div>

      <CtaBtn type="submit">
        <>Continue to payment <ArrowIcon /></>
      </CtaBtn>
    </form>
  )
}
