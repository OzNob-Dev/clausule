'use client'

import { useMfaSetupFlow } from '@mfa/hooks/useMfaSetupFlow'
import MfaOtpStep from '@mfa/components/MfaOtpStep'
import MfaSuccessStep from '@mfa/components/MfaSuccessStep'
import MfaTotpStep from '@mfa/components/MfaTotpStep'
import '@mfa/styles/mfa-layout.css'
import '@mfa/styles/mfa-factors.css'
import '@mfa/styles/code-email.css'
import '@shared/styles/page-loader.css'

export default function MfaSetup() {
  const flow = useMfaSetupFlow()
  const stepLabels = ['Verify email', 'Secure account', 'All set']

  return (
    <div className="mfa-wrap page-enter">
      <main className="mfa-card">

        {/* Progress */}
        <nav className="mfa-progress" aria-label="Setup progress">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={[
                'mfa-seg',
                flow.step > n   ? 'mfa-seg--done'   : '',
                flow.step === n ? 'mfa-seg--active' : '',
              ].join(' ')}
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
