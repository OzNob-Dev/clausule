import AuthBrandPanel from '@features/auth/components/AuthBrandPanel'
import '@features/signup/styles/signup-theme.css'
import '@features/signup/styles/signup-form.css'

export default function AuthLayout({ children }) {
  return (
    <div className="su-shell-wrap su-page">
      <div className="su-shell">
        <AuthBrandPanel brandHref="/" />
        <div className="su-shell-right su-page flex-col justify-start">
          {children}
        </div>
      </div>
    </div>
  )
}
