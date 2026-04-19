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
      <h2 className="si-heading">Welcome back</h2>
      <p className="si-subheading">We'll send a verification code to your email.</p>

      {ssoError && (
        <p className="si-field-hint si-field-hint--error" role="alert" style={{ marginBottom: 14 }}>
          {ssoError}
        </p>
      )}

      <form className="si-form" onSubmit={onSubmit} noValidate>
        <div className="si-field">
          <label className="si-label" htmlFor="si-email">Email</label>
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
            className={[
              'si-input',
              showFeedback && result.error ? 'si-input--error' : '',
              showFeedback && result.suggestion ? 'si-input--warn' : '',
            ].filter(Boolean).join(' ')}
          />

          <div id="si-email-hint" aria-live="polite">
            {showFeedback && result.error && (
              <p className="si-field-hint si-field-hint--error" role="alert">
                {result.error}
              </p>
            )}
            {showFeedback && result.suggestion && (
              <p className="si-field-hint si-field-hint--suggest" role="alert">
                Did you mean{' '}
                <button type="button" className="si-suggest-btn" onClick={onAcceptSuggestion}>
                  {result.suggestion}
                </button>
                ?
              </p>
            )}
            {!result.error && !result.suggestion && isNewAccount && (
              <p className="si-field-hint si-field-hint--info">
                No account found — we'll get you set up.
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className={`si-btn-primary${isNewAccount ? ' si-btn-primary--signup' : ''}`}
          disabled={!email.trim() || isChecking}
          aria-busy={isChecking}
        >
          {btnLabel}
        </button>
      </form>

    </>
  )
}
