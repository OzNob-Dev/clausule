import SignInBrandPanel from '@shared/components/ui/SignInBrandPanel'
import panelConfig from '@auth/brand-panel-config.json'

export default function LoginShell({ children }) {
  const config = panelConfig['/']

  return (
    <div className="su-shell-wrap su-page">
      <div className="su-shell">
        <SignInBrandPanel brandHref="/" headline={config.headline} subtext={config.subtext} />
        <div className="su-shell-right su-page flex-col justify-start">
          {children}
        </div>
      </div>
    </div>
  )
}
