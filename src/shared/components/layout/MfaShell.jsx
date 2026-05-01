import SignInBrandPanel from '@shared/components/ui/SignInBrandPanel'
import { authShellFrameClassName, authShellRightClassName, authShellRootClassName } from './authShellClasses'

const MFA_COPY = {
  headline: 'Secure your account.\nFinish setup.',
  subtext: 'Verify your email, connect your authenticator app, and complete the final security step before entering Clausule.',
}

export default function MfaShell({ children }) {
  return (
    <div className={authShellRootClassName}>
      <div className={authShellFrameClassName}>
        <SignInBrandPanel brandHref="/" headline={MFA_COPY.headline} subtext={MFA_COPY.subtext} />
        <div className={authShellRightClassName}>
          {children}
        </div>
      </div>
    </div>
  )
}
