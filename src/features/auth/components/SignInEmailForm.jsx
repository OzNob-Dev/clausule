import { cn } from '@shared/utils/cn'

export default function SignInEmailForm({
  email,
  result,
  showFeedback,
  isChecking,
  btnLabel,
  ssoError,
  submitError,
  onAcceptSuggestion,
  onBlur,
  onChange,
  onPaste,
  onSubmit,
}) {
  return (
    <>
      <div className="su-step-heading">Welcome back</div>
      <div className="su-step-sub">We'll send a verification code to your email.</div>

      {ssoError && (
        <p className="su-field-hint su-field-hint--error" role="alert">
          {ssoError}
        </p>
      )}
      {submitError && (
        <p className="su-field-hint su-field-hint--error" role="alert">
          {submitError}
        </p>
      )}

      <form className="w-full" onSubmit={onSubmit} noValidate>
        <div className="su-field">
          <label className="su-field-label" htmlFor="si-email">Email</label>
          <input
            id="si-email"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={onChange}
            onBlur={onBlur}
            onPaste={onPaste}
            autoFocus
            autoComplete="email"
            required
            aria-invalid={showFeedback && !result.valid && !result.suggestion}
            aria-describedby="si-email-hint"
            className={cn(
              'su-input',
              showFeedback && result.error && 'su-input--error',
              showFeedback && result.suggestion && 'su-input--warn'
            )}
          />

          <div id="si-email-hint" aria-live="polite">
            {showFeedback && result.error && (
              <p className="su-field-hint su-field-hint--error" role="alert">
                {result.error}
              </p>
            )}
            {showFeedback && result.suggestion && (
              <p className="su-field-hint su-field-hint--suggest" role="alert">
                Did you mean{' '}
                <button type="button" className="su-suggest-btn" onClick={onAcceptSuggestion}>
                  {result.suggestion}
                </button>
                ?
              </p>
            )}
          </div>
        </div>

        <button type="submit" className="su-cta-btn" disabled={!email.trim() || isChecking} aria-busy={isChecking}>
          {btnLabel}
        </button>
      </form>
    </>
  )
}
