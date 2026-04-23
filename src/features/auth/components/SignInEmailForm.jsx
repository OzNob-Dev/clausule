import { cn } from '@shared/utils/cn'

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
      <h2 className="text-[22px] font-black tracking-[-0.5px] text-tp mb-1">Welcome back</h2>
      <p className="text-[13px] text-tm mb-7 leading-[1.6]">We'll send a verification code to your email.</p>

      {ssoError && (
        <p className="text-[11px] font-medium mt-[6px] leading-[1.4] text-[#C0392B] mb-[14px]" role="alert">
          {ssoError}
        </p>
      )}

      <form className="w-full" onSubmit={onSubmit} noValidate>
        <div className="mb-5">
          <label className="block text-[10px] font-bold uppercase tracking-[0.6px] text-tm mb-2" htmlFor="si-email">Email</label>
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
              'w-full rounded-[var(--r)] border-[1.5px] border-rule-em bg-canvas px-[13px] py-[11px] font-sans text-[15px] font-medium text-tp outline-none transition-colors duration-200 placeholder:text-tm focus:border-tp',
              showFeedback && result.error && 'border-[#C0392B]',
              showFeedback && result.suggestion && 'border-[#C07A00]'
            )}
          />

          <div id="si-email-hint" aria-live="polite">
            {showFeedback && result.error && (
              <p className="text-[11px] font-medium mt-[6px] leading-[1.4] text-[#C0392B]" role="alert">
                {result.error}
              </p>
            )}
            {showFeedback && result.suggestion && (
              <p className="text-[11px] font-medium mt-[6px] leading-[1.4] text-[#8a6200]" role="alert">
                Did you mean{' '}
                <button type="button" className="bg-transparent border-none p-0 font-inherit text-[11px] font-bold text-[#8a6200] underline cursor-pointer hover:text-[#5c4100]" onClick={onAcceptSuggestion}>
                  {result.suggestion}
                </button>
                ?
              </p>
            )}
            {!result.error && !result.suggestion && isNewAccount && (
              <p className="text-[11px] font-medium mt-[6px] leading-[1.4] text-[#2A6B45]">
                No account found — we'll get you set up.
              </p>
            )}
          </div>
        </div>

        <button type="submit" className="mb-4 w-full rounded-[var(--r)] border-none bg-acc p-[13px] font-sans text-[14px] font-extrabold tracking-[-0.2px] text-[#FDFCFA] cursor-pointer transition-opacity duration-150 hover:opacity-[0.88] disabled:cursor-default disabled:opacity-55" disabled={!email.trim() || isChecking} aria-busy={isChecking}>
          {btnLabel}
        </button>
      </form>
    </>
  )
}
