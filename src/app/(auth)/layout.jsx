import { DM_Serif_Display } from 'next/font/google'
import AuthBrandPanel from '@shared/components/ui/AuthBrandPanel'
import '@signup/styles/signup-theme.css'
import '@signup/styles/signup-form.css'

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export default function AuthLayout({ children }) {
  return (
    <div className={`su-shell-wrap su-page ${dmSerif.variable}`}>
      <div className="su-shell">
        <AuthBrandPanel brandHref="/" />
        <div className="su-shell-right su-page flex-col justify-start">
          {children}
        </div>
      </div>
    </div>
  )
}
