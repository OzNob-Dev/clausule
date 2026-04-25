'use client'

import { ssoConfigFromEnv } from '@shared/utils/sso'
import SignInBrandPanel from '@features/auth/components/SignInBrandPanel'
import SignInEmailForm from '@features/auth/components/SignInEmailForm'
import SignUpPrompt from '@features/auth/components/SignUpPrompt'
import SsoButtons from '@features/auth/components/SsoButtons'
import { useSignInFlow } from '@features/auth/hooks/useSignInFlow'
import MfaLoginEmailStep from '@features/mfa/components/MfaLoginEmailStep'
import MfaLoginAppStep from '@features/mfa/components/MfaLoginAppStep'
import '@features/mfa/styles/mfa-layout.css'
import '@features/signup/styles/signup-theme.css'
import '@features/signup/styles/signup-form.css'

export default function SignIn() {
  const flow = useSignInFlow()

  if (flow.step === 'app') {
    return (
      <MfaLoginAppStep
        email={flow.email}
        otp={flow.code.digits}
        otpRefs={flow.codeRefs}
        otpState={flow.code.state}
        onBack={flow.resetCodeStep}
        onChange={flow.code.handleChange}
        onKeyDown={flow.code.handleKeyDown}
        onPaste={flow.code.handlePaste}
        onVerify={() => flow.verifyApp(flow.code.digits)}
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
        expirySeconds={flow.expirySeconds}
        resendTimer={flow.resendTimer}
        onBack={flow.resetCodeStep}
        onChange={flow.code.handleChange}
        onKeyDown={flow.code.handleKeyDown}
        onPaste={flow.code.handlePaste}
        onVerify={() => flow.verifyOtp(flow.code.digits)}
        onResend={flow.handleResend}
      />
    )
  }

  return (
    <div className="su-shell-wrap su-page">
      <div className="su-shell">
        <SignInBrandPanel />

        <div className="su-shell-right su-page flex-col justify-start">
          <div className="su-narrow">
            <SignInEmailForm
              email={flow.email}
              result={flow.result}
              showFeedback={flow.showFeedback}
              isChecking={flow.isChecking}
              isNewAccount={flow.isNewAccount}
              btnLabel={flow.btnLabel}
              ssoError={flow.ssoError}
              onAcceptSuggestion={flow.acceptSuggestion}
              onBlur={() => flow.setTouched(true)}
              onChange={flow.handleEmailChange}
              onPaste={flow.handlePaste}
              onSubmit={flow.handleSubmit}
            />
            <SsoButtons config={ssoConfigFromEnv} />
            {!flow.isNewAccount && <SignUpPrompt />}
          </div>
        </div>
      </div>
    </div>
  )
}
