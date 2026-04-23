'use client'

import { useMfaSetupFlow } from '@features/mfa/hooks/useMfaSetupFlow'
import MfaOtpStep from '@features/mfa/components/MfaOtpStep'
import MfaSuccessStep from '@features/mfa/components/MfaSuccessStep'
import MfaTotpStep from '@features/mfa/components/MfaTotpStep'
import { cn } from '@shared/utils/cn'
import { mfaUi } from '@features/mfa/components/mfaClasses'

export default function MfaSetup() {
  const flow = useMfaSetupFlow()
  const stepLabels = ['Verify email', 'Secure account', 'All set']

  return (
    <div className={mfaUi.setupWrap}>
      <div className={mfaUi.setupCard} role="main">
        <nav className={mfaUi.progress} aria-label="Setup progress">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={cn(mfaUi.progressSeg, flow.step > n && mfaUi.progressSegDone, flow.step === n && mfaUi.progressSegActive)}
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
            onResend={flow.resetResendTimer}
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
      </div>
    </div>
  )
}
