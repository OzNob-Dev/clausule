import SignInBrandPanel from '@shared/components/ui/SignInBrandPanel'
import SignupPanelSummary from '@shared/components/SignupPanelSummary'
import SignupPlanPanelContent from '@shared/components/SignupPlanPanelContent'
import SignupProgress from '@shared/components/SignupProgress'
import panelConfig from '@auth/brand-panel-config.json'
import '@signup/styles/signup-theme.css'
import '@signup/styles/signup-form.css'

export default function SignupShell({ children, pathname }) {
  const config = panelConfig[pathname] ?? panelConfig['/signup']

  return (
    <div className="su-shell-wrap su-page">
      <div className="su-shell">
        <SignInBrandPanel brandHref="/" headline={config.headline} subtext={config.subtext}>
          {pathname === '/signup' && <SignupPanelSummary />}
          {pathname === '/signup/plan' && <SignupPlanPanelContent />}
          <SignupProgress pathname={pathname} />
        </SignInBrandPanel>
        <div className="su-shell-right su-page flex-col justify-start">
          {children}
        </div>
      </div>
    </div>
  )
}
