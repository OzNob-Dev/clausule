import SignInBrandPanel from '@shared/components/ui/SignInBrandPanel'
import SignupPanelSummary from '@shared/components/SignupPanelSummary'
import SignupPlanPanelContent from '@shared/components/SignupPlanPanelContent'
import SignupProgress from '@shared/components/SignupProgress'
import panelConfig from '@auth/brand-panel-config.json'
import { authShellFrameClassName, authShellRightClassName, authShellRootClassName } from './authShellClasses'

export default function SignupShell({ children, pathname }) {
  const shellPathname = pathname === '/register' ? '/signup' : pathname
  const config = panelConfig[shellPathname] ?? panelConfig['/signup']

  return (
    <div className={authShellRootClassName}>
      <div className={authShellFrameClassName}>
        <SignInBrandPanel brandHref="/" headline={config.headline} subtext={config.subtext}>
          {shellPathname === '/signup' && <SignupPanelSummary />}
          {shellPathname === '/signup/plan' && <SignupPlanPanelContent />}
          <SignupProgress pathname={shellPathname} />
        </SignInBrandPanel>
        <div className={authShellRightClassName}>
          {children}
        </div>
      </div>
    </div>
  )
}
