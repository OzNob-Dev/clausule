export default function MfaSuccessStep({ onEnterApp }) {
  return (
    <div className="mfa-pane mfa-pane--center" key="success">
      <div className="mfa-success-ring" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="mfa-heading">You're protected</h1>
      <p className="mfa-sub">
        Your account is secured with multi-factor authentication.
        You'll verify your identity each time you sign in.
      </p>
      <button className="mfa-enter-btn" onClick={onEnterApp}>
        Enter Clausule
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </button>
    </div>
  )
}
