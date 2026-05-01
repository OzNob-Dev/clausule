
export function CodeEmail({ to, code = '••••••', revealed = false }) {
  const digits = String(code).replace(/\s+/g, '').slice(0, 6).padEnd(6, '•').split('')
  const digitClassName = revealed
    ? 'ce-digit flex h-9 w-[30px] items-center justify-center rounded-[var(--cl-radius-sm)] border-[1.5px] border-[var(--cl-accent-soft-8)] bg-[var(--cl-surface-paper)] text-[var(--cl-text-xl)] font-extrabold text-[var(--cl-accent-code)]'
    : 'ce-digit ce-digit--hidden relative flex h-9 w-[30px] items-center justify-center rounded-[var(--cl-radius-sm)] border-[1.5px] border-[var(--cl-accent-soft-15)] bg-[var(--cl-accent-soft)] text-transparent select-none after:absolute after:content-[\'•\'] after:text-[var(--cl-text-2xl)] after:leading-none after:text-[var(--cl-accent-code)]'

  return (
    <div className="ce-shell mb-6 w-full overflow-hidden rounded-[var(--cl-radius-lg)] border border-[var(--cl-border-3)] bg-[var(--cl-surface-white)] text-left shadow-[var(--cl-shadow-paper)]" aria-label="Demo verification email" role="img">
      <div className="ce-chrome flex items-center gap-[5px] border-b border-[var(--cl-grid-2)] bg-[var(--cl-surface-paper-3)] px-3 py-2">
        <div className="ce-chrome-dot h-2 w-2 rounded-full bg-[var(--cl-window-red)]" />
        <div className="ce-chrome-dot h-2 w-2 rounded-full bg-[var(--cl-window-amber)]" />
        <div className="ce-chrome-dot h-2 w-2 rounded-full bg-[var(--cl-window-green)]" />
        <span className="ce-chrome-label ml-1.5 text-[var(--cl-text-2xs)] font-semibold tracking-[0.3px] text-[var(--cl-muted-10)]">Mail</span>
      </div>

      <div className="ce-header flex items-center gap-2.5 border-b border-[var(--cl-rule-3)] px-4 pb-2 pt-3">
        <div className="ce-avatar flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[var(--cl-accent-alpha-85)] text-[var(--cl-text-md)] font-bold text-[var(--cl-surface-white)]" aria-hidden="true">C</div>
        <div className="ce-meta min-w-0 flex-1">
          <div className="ce-from overflow-hidden text-ellipsis whitespace-nowrap text-[var(--cl-text-sm)] font-semibold text-[var(--cl-ink-7)]">Clausule <span className="ce-from-addr text-[var(--cl-text-2xs)] font-normal text-[var(--cl-muted-10)]">&lt;noreply@clausule.app&gt;</span></div>
          <div className="ce-to mt-px text-[var(--cl-text-2xs)] text-[var(--cl-muted-10)]">To: {to}</div>
        </div>
        <div className="ce-time shrink-0 text-[var(--cl-text-2xs)] text-[var(--cl-muted-11)]">just now</div>
      </div>

      <div className="ce-subject px-4 pb-1 pt-2 text-[var(--cl-text-sm)] font-bold text-[var(--cl-ink-7)]">Your Clausule sign-in code</div>

      <div className="ce-body px-4 pb-4 pt-1">
        <p className="ce-greeting mb-1 text-[var(--cl-text-sm)] text-[var(--cl-ink-7)]">Hi there,</p>
        <p className="ce-copy mb-3 text-[var(--cl-text-sm)] leading-[1.5] text-[var(--cl-surface-muted-4)]">Use the code below to sign in. It expires in 10 minutes.</p>
        <div className="ce-code-block mb-3 flex gap-[5px]" aria-label="Verification code sent to your email">
          {digits.map((digit, index) => (
            <span key={index} className={digitClassName}>
              {digit}
            </span>
          ))}
        </div>
        <p className="ce-disclaimer m-0 text-[var(--cl-text-2xs)] leading-[1.5] text-[var(--cl-muted-11)]">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
  )
}
