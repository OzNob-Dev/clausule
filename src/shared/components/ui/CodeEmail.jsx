export function CodeEmail({ to, code = '••••••', revealed = false }) {
  const digits = String(code).replace(/\s+/g, '').slice(0, 6).padEnd(6, '•').split('')

  return (
    <div className="ce-shell" aria-label="Demo verification email" role="img">
      {/* Email client chrome */}
      <div className="ce-chrome">
        <div className="ce-chrome-dot" />
        <div className="ce-chrome-dot" />
        <div className="ce-chrome-dot" />
        <span className="ce-chrome-label">Mail</span>
      </div>

      {/* Header row */}
      <div className="ce-header">
        <div className="ce-avatar" aria-hidden="true">C</div>
        <div className="ce-meta">
          <div className="ce-from">Clausule <span className="ce-from-addr">&lt;noreply@clausule.app&gt;</span></div>
          <div className="ce-to">To: {to}</div>
        </div>
        <div className="ce-time">just now</div>
      </div>

      <div className="ce-subject">Your Clausule sign-in code</div>

      {/* Body */}
      <div className="ce-body">
        <p className="ce-greeting">Hi there,</p>
        <p className="ce-copy">Use the code below to sign in. It expires in 10 minutes.</p>
        <div className="ce-code-block" aria-label="Verification code sent to your email">
          {digits.map((digit, index) => (
            <span key={index} className={revealed ? 'ce-digit' : 'ce-digit ce-digit--hidden'}>
              {digit}
            </span>
          ))}
        </div>
        <p className="ce-disclaimer">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
  )
}
