import { headers } from 'next/headers'
import SignInBrandPanel from '@features/auth/components/SignInBrandPanel'
import panelConfig from '@features/auth/brand-panel-config.json'
import '@features/signup/styles/signup-theme.css'
import '@features/signup/styles/signup-form.css'

export default async function AuthLayout({ children }) {
  const headersList = await headers()
  const pathname = headersList.get('x-clausule-pathname') ?? '/'
  const config = panelConfig[pathname] ?? panelConfig['/']

  return (
    <div className="su-shell-wrap su-page">
      <div className="su-shell">
        <SignInBrandPanel
          brandHref="/"
          headline={config.headline}
          subtext={config.subtext}
        />
        <div className="su-shell-right su-page flex-col justify-start">
          {children}
        </div>
      </div>
    </div>
  )
}
