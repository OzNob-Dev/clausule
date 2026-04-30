import { Button } from '@shared/components/ui/Button'
import { ArrowIcon } from '@shared/components/ui/icon/ArrowIcon'
import { CheckIcon } from '@shared/components/ui/icon/CheckIcon'

export default function MfaSuccessStep({ onEnterApp }) {
  return (
    <div className="mfa-pane mfa-pane--center" key="success">
      <div className="mfa-success-ring" aria-hidden="true">
        <CheckIcon size={24} />
      </div>
      <h1 className="mfa-heading">You're protected</h1>
      <p className="mfa-sub">
        Your account is secured with multi-factor authentication.
        You'll verify your identity each time you sign in.
      </p>
      <Button className="mfa-enter-btn" onClick={onEnterApp}>
        Enter Clausule
        <ArrowIcon />
      </Button>
    </div>
  )
}
