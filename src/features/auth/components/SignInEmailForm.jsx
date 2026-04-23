import { cn } from '@shared/utils/cn'
import { signupUi } from '@features/signup/components/signupClasses'

export default function SignInEmailForm({
  email,
  result,
  showFeedback,
  isChecking,
  isNewAccount,
  btnLabel,
  ssoError,
  onAcceptSuggestion,
  onBlur,
  onChange,
  onPaste,
  onSubmit,
}) {
  return (
    <>
      <div className={signupUi.heading}>Welcome back</div>
      <div className={signupUi.sub}>We'll send a verification code to your email.</div>

      {ssoError && (
        <p className={cn(signupUi.hint, signupUi.hintError)} role="alert">
          {ssoError}
        </p>
      )}

      <form className="w-full" onSubmit={onSubmit} noValidate>
        <div className={signupUi.field}>
          <label className={signupUi.label} htmlFor="si-email">Email</label>
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
              signupUi.input,
              showFeedback && result.error && signupUi.inputError,
              showFeedback && result.suggestion && 'border-[#C9A84C] bg-[rgba(201,168,76,0.06)]'
            )}
          />

          <div id="si-email-hint" aria-live="polite">
            {showFeedback && result.error && (
              <p className={cn(signupUi.hint, signupUi.hintError)} role="alert">
                {result.error}
              </p>
            )}
            {showFeedback && result.suggestion && (
              <p className={cn(signupUi.hint, signupUi.hintWarn)} role="alert">
                Did you mean{' '}
                <button type="button" className={signupUi.suggestion} onClick={onAcceptSuggestion}>
                  {result.suggestion}
                </button>
                ?
              </p>
            )}
            {!result.error && !result.suggestion && isNewAccount && (
              <p className={signupUi.hint}>
                No account found — we'll get you set up.
              </p>
            )}
          </div>
        </div>

        <button type="submit" className={signupUi.cta} disabled={!email.trim() || isChecking} aria-busy={isChecking}>
          {btnLabel}
        </button>
      </form>
    </>
  )
}
