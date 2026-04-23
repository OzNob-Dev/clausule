import CodeEmail from '@shared/components/ui/CodeEmail'
import DigitRow from './DigitRow'
import { mfaUi } from './mfaClasses'

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
    <div className={mfaUi.pane} key="otp">
      <div className={mfaUi.iconWrap} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10l9 6 9-6" />
        </svg>
      </div>
      <h1 className={`${mfaUi.heading} text-center`}>Check your email</h1>
      <p className={`${mfaUi.sub} text-center`}>
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
      {otpState === 'error' && <p className={`${mfaUi.error} text-center`} role="alert">Incorrect code — try again</p>}
      <p className={mfaUi.resend}>
        {resendTimer > 0 ? (
          <span>Resend in {resendTimer}s</span>
        ) : (
          <button className={mfaUi.resendBtn} onClick={onResend}>Resend code</button>
        )}
      </p>
    </div>
  )
}
