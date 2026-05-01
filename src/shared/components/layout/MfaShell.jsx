import SignInBrandPanel from '@shared/components/ui/SignInBrandPanel'

const MFA_COPY = {
  headline: 'Secure your account.\nFinish setup.',
  subtext: 'Verify your email, connect your authenticator app, and complete the final security step before entering Clausule.',
}

export default function MfaShell({ children }) {
  return (
    <div className="su-shell-wrap su-page">
      <div className="su-shell">
        <SignInBrandPanel brandHref="/" headline={MFA_COPY.headline} subtext={MFA_COPY.subtext} />
        <div className="su-shell-right su-page flex-col justify-start">
          {children}
        </div>
      </div>
    </div>
  )
}
