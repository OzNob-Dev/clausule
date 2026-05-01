'use client'

import { useMfaSetupFlow } from '@mfa/hooks/useMfaSetupFlow'
import MfaOtpStep from '@shared/components/MfaOtpStep'
import MfaSuccessStep from '@shared/components/MfaSuccessStep'
import MfaTotpStep from '@shared/components/MfaTotpStep'

export default function MfaSetup() {
  const flow = useMfaSetupFlow()
  const stepLabels = ['Verify email', 'Secure account', 'All set']

  return (
    <div className="mfa-wrap page-enter flex min-h-screen w-full items-center justify-center bg-[var(--cl-surface-muted-13)] p-6">
      <main className="mfa-card w-[480px] max-w-full rounded-[20px] bg-[var(--cl-surface-paper)] px-11 pb-12 pt-9 shadow-[var(--cl-shadow-strong)] max-[480px]:rounded-[var(--cl-radius-2xl)] max-[480px]:px-[22px] max-[480px]:pb-10 max-[480px]:pt-7">

        {/* Progress */}
        <nav className="mfa-progress mb-10 flex gap-1.5" aria-label="Setup progress">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={[
                'mfa-seg h-[3px] flex-1 rounded-[2px] bg-[var(--cl-border)] transition-[background,opacity] duration-300',
                flow.step > n   ? 'mfa-seg--done'   : '',
                flow.step === n ? 'mfa-seg--active' : '',
              ].join(' ')}
              style={{
                background: flow.step >= n ? 'var(--acc)' : undefined,
                opacity: flow.step === n ? 0.45 : undefined,
              }}
              aria-label={`Step ${n}: ${stepLabels[n - 1]}${flow.step > n ? ' (complete)' : flow.step === n ? ' (current)' : ''}`}
            />
          ))}
        </nav>

        {flow.step === 1 && (
          <MfaOtpStep
            email={flow.email}
            otp={flow.otpCode.digits}
            otpRefs={flow.otpRefs}
            otpState={flow.otpCode.state}
            resendTimer={flow.resendTimer}
            onChange={flow.otpCode.handleChange}
            onKeyDown={flow.otpCode.handleKeyDown}
            onPaste={flow.otpCode.handlePaste}
            onResend={flow.handleResend}
          />
        )}

        {flow.step === 2 && (
          <MfaTotpStep
            copied={flow.copied}
            onCopySecret={flow.copySecret}
            onContinue={flow.finishSetup}
            totp={flow.totpCode.digits}
            totpDone={flow.totpDone}
            totpLoading={flow.totpLoading}
            totpRefs={flow.totpRefs}
            totpSecretDisp={flow.totpSecretDisp}
            totpState={flow.totpCode.state}
            totpUri={flow.totpUri}
            onChange={flow.totpCode.handleChange}
            onKeyDown={flow.totpCode.handleKeyDown}
            onPaste={flow.totpCode.handlePaste}
          />
        )}

        {flow.step === 3 && <MfaSuccessStep onEnterApp={flow.enterApp} />}

      </main>
    </div>
  )
}
