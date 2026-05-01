import { Button } from '@shared/components/ui/Button'
import { ArrowIcon } from '@shared/components/ui/icon/ArrowIcon'
import { CheckIcon } from '@shared/components/ui/icon/CheckIcon'

export default function MfaSuccessStep({ onEnterApp }) {
  return (
    <div className="mfa-pane mfa-pane--center flex animate-[mfa-in_0.28s_cubic-bezier(0.25,0.46,0.45,0.94)_both] flex-col items-center text-center" key="success">
      <div className="mfa-success-ring mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,var(--acc),color-mix(in_srgb,var(--acc)_72%,white)_58%,transparent_59%),linear-gradient(180deg,color-mix(in_srgb,var(--cl-surface-paper)_92%,white),var(--cl-surface-paper))] text-[var(--cl-surface-paper)] shadow-[0_18px_45px_var(--cl-accent-alpha-25)]" aria-hidden="true">
        <CheckIcon size={24} />
      </div>
      <h1 className="mfa-heading mb-2.5 text-[23px] font-black leading-[1.2] tracking-[-0.5px] text-[var(--cl-surface-ink)] max-[480px]:text-[var(--cl-title-sm)]">You're protected</h1>
      <p className="mfa-sub mb-7 max-w-[320px] text-[var(--cl-text-base)] leading-[1.7] text-[var(--cl-surface-muted-3)]">
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
