import SignInBrandPanel from '@shared/components/ui/SignInBrandPanel'
import panelConfig from '@auth/brand-panel-config.json'
import { authShellFrameClassName, authShellRightClassName, authShellRootClassName } from './authShellClasses'

export default function LoginShell({ children }) {
  const config = panelConfig['/']

  return (
    <div className={authShellRootClassName}>
      <div className={authShellFrameClassName}>
        <SignInBrandPanel brandHref="/" headline={config.headline} subtext={config.subtext} />
        <div className={authShellRightClassName}>
          {children}
        </div>
      </div>
    </div>
  )
}
