import './MfaOtpStep.css'
import { CodeEmail } from '@shared/components/ui/CodeEmail'
import { Button } from '@shared/components/ui/Button'
import { MailIcon } from '@shared/components/ui/icon/MailIcon'
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
        <MailIcon />
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
          <Button type="button" variant="ghost" className="mfa-resend-btn" onClick={onResend}>Resend code</Button>
        )}
      </p>
    </div>
  )
}
