import CodeEmail from '@/components/ui/CodeEmail'
import DigitRow from './DigitRow'

export default function MfaOtpStep({
  email,
  otp,
  otpRefs,
  otpState,
  resendTimer,
  onChange,
  onKeyDown,
  onPaste,
  onResend,
}) {
  return (
    <div className="mfa-pane" key="otp">
      <div className="mfa-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10l9 6 9-6" />
        </svg>
      </div>
      <h1 className="mfa-heading">Check your email</h1>
      <p className="mfa-sub">
        We sent a 6-digit code to <strong>{email}</strong>
      </p>
      <CodeEmail to={email} />
      <DigitRow
        digits={otp}
        inputState={otpState}
        inputRefs={otpRefs}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
      />
      {otpState === 'error' && <p className="mfa-error" role="alert">Incorrect code — try again</p>}
      <p className="mfa-resend">
        {resendTimer > 0 ? (
          <span>Resend in {resendTimer}s</span>
        ) : (
          <button className="mfa-resend-btn" onClick={onResend}>Resend code</button>
        )}
      </p>
    </div>
  )
}
