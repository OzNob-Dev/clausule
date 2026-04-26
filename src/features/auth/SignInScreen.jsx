'use client'

import { ssoConfigFromEnv } from '@shared/utils/sso'
import SignInEmailForm from '@features/auth/components/SignInEmailForm'
import SignUpPrompt from '@features/auth/components/SignUpPrompt'
import SsoButtons from '@features/auth/components/SsoButtons'
import { useSignInFlow } from '@features/auth/hooks/useSignInFlow'
import MfaLoginEmailStep from '@features/mfa/components/MfaLoginEmailStep'
import MfaLoginAppStep from '@features/mfa/components/MfaLoginAppStep'
import '@features/mfa/styles/mfa-layout.css'

export default function SignIn() {
  const flow = useSignInFlow()

  if (flow.step === 'app') {
    return (
      <MfaLoginAppStep
        email={flow.email}
        otp={flow.code.digits}
        otpRefs={flow.codeRefs}
        otpState={flow.code.state}
        errorMessage={flow.verifyError}
        onBack={flow.resetCodeStep}
        onChange={flow.code.handleChange}
        onKeyDown={flow.code.handleKeyDown}
        onPaste={flow.code.handlePaste}
        onVerify={flow.submitApp}
        onUseRecovery={null}
      />
    )
  }

  if (flow.step === 'otp') {
    return (
      <MfaLoginEmailStep
        email={flow.email}
        otp={flow.code.digits}
        otpRefs={flow.codeRefs}
        otpState={flow.code.state}
        errorMessage={flow.verifyError}
        expirySeconds={flow.expirySeconds}
        resendTimer={flow.resendTimer}
        onBack={flow.resetCodeStep}
        onChange={flow.code.handleChange}
        onKeyDown={flow.code.handleKeyDown}
        onPaste={flow.code.handlePaste}
        onVerify={flow.submitOtp}
        onResend={flow.handleResend}
      />
    )
  }

  return (
    <div className="su-narrow">
      <SignInEmailForm
        email={flow.email}
        result={flow.result}
        showFeedback={flow.showFeedback}
        isChecking={flow.isChecking}
        btnLabel={flow.btnLabel}
        ssoError={flow.ssoError}
        submitError={flow.submitError}
        onAcceptSuggestion={flow.acceptSuggestion}
        onBlur={flow.handleEmailBlur}
        onChange={flow.handleEmailChange}
        onPaste={flow.handlePaste}
        onSubmit={flow.handleSubmit}
      />
      <SsoButtons config={ssoConfigFromEnv} />
      <SignUpPrompt />
    </div>
  )
}
