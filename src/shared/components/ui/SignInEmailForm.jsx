import { cn } from '@shared/utils/cn'
import { Button } from './Button'
import { FieldHint, FieldInput, FieldLabel } from './Field'

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

      {ssoError && <p className="su-field-hint su-field-hint--error" role="alert">{ssoError}</p>}
      {submitError && <p className="su-field-hint su-field-hint--error" role="alert">{submitError}</p>}

      <form className="w-full" onSubmit={onSubmit} noValidate>
        <div className="su-field">
          <FieldLabel htmlFor="si-email">Email</FieldLabel>
          <FieldInput
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
            error={showFeedback && !!result.error}
            aria-invalid={showFeedback && !result.valid && !result.suggestion}
            aria-describedby="si-email-hint"
            className={cn(showFeedback && result.suggestion && 'su-input--warn')}
          />

          <div id="si-email-hint" aria-live="polite">
            {showFeedback && result.error && <FieldHint error role="alert">{result.error}</FieldHint>}
            {showFeedback && result.suggestion && (
              <FieldHint className="su-field-hint--suggest" role="alert">
                Did you mean{' '}
                <Button type="button" variant="ghost" size="sm" className="su-suggest-btn" onClick={onAcceptSuggestion}>
                  {result.suggestion}
                </Button>
                ?
              </FieldHint>
            )}
          </div>
        </div>

        <Button type="submit" className="su-cta-btn" disabled={!email.trim() || isChecking} aria-busy={isChecking}>
          {btnLabel}
        </Button>
      </form>
    </>
  )
}
