'use client'

import { ssoConfigFromEnv } from '@shared/utils/sso'
import SignInEmailForm from '@shared/components/ui/SignInEmailForm'
import SignUpPrompt from '@shared/components/ui/SignUpPrompt'
import SsoButtons from '@shared/components/ui/SsoButtons'
import { useSignInFlow } from '@auth/hooks/useSignInFlow'
import MfaLoginEmailStep from '@shared/components/MfaLoginEmailStep'
import MfaLoginAppStep from '@shared/components/MfaLoginAppStep'
import { authShellNarrowClassName } from '@shared/components/layout/authShellClasses'

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
    <div className={`${authShellNarrowClassName} su-auth-stack page-enter`}>
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
