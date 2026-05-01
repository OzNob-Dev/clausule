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
      <div className="su-step-sub mb-6">We'll send a verification code to your email.</div>

      {ssoError && <p className="su-field-hint su-field-hint--error mt-[5px] text-[var(--cl-text-xs)] font-medium text-[var(--cl-danger-2)]" role="alert">{ssoError}</p>}
      {submitError && <p className="su-field-hint su-field-hint--error mt-[5px] text-[var(--cl-text-xs)] font-medium text-[var(--cl-danger-2)]" role="alert">{submitError}</p>}

      <form className="su-auth-stack mx-auto w-full max-w-[420px]" onSubmit={onSubmit} noValidate>
        <div className="su-field mb-[18px]">
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
            className={cn(showFeedback && result.suggestion && 'su-input--warn border-[var(--cl-warning-2)]')}
          />

          <div id="si-email-hint" className="mt-[5px]" aria-live="polite">
            {showFeedback && result.error && <FieldHint error role="alert">{result.error}</FieldHint>}
            {showFeedback && result.suggestion && (
              <FieldHint className="su-field-hint--suggest text-[var(--cl-warning)]" role="alert">
                Did you mean{' '}
                <Button type="button" variant="ghost" size="sm" className="su-suggest-btn inline border-0 bg-transparent p-0 text-[var(--cl-warning)] text-[var(--cl-text-xs)] font-bold underline underline-offset-2 shadow-none hover:bg-transparent hover:text-[var(--cl-warning-2)] hover:opacity-100 hover:translate-y-0" onClick={onAcceptSuggestion}>
                  {result.suggestion}
                </Button>
                ?
              </FieldHint>
            )}
          </div>
        </div>

        <Button type="submit" className="su-cta-btn w-full justify-center rounded-[var(--su-r)] border-0 bg-[var(--su-acc)] px-[15px] py-[15px] [font-family:var(--su-font)] text-[var(--cl-text-lg)] font-extrabold tracking-[-0.2px] text-[var(--su-canvas)] shadow-none hover:bg-[var(--su-acc)] hover:opacity-88 hover:translate-y-0 disabled:opacity-60" disabled={!email.trim() || isChecking} aria-busy={isChecking}>
          {btnLabel}
        </Button>
      </form>
    </>
  )
}
