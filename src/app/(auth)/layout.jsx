import AuthBrandPanel from '@shared/components/ui/AuthBrandPanel'
import '@signup/styles/signup-theme.css'
import '@signup/styles/signup-form.css'

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
