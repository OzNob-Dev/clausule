'use client'
import './AuthBrandPanel.css'
import { usePathname } from 'next/navigation'
import SignInBrandPanel from './SignInBrandPanel'
import SignupPanelSummary from '@shared/components/SignupPanelSummary'
import SignupPlanPanelContent from '@shared/components/SignupPlanPanelContent'
import SignupProgress from '@shared/components/SignupProgress'
import panelConfig from '@auth/brand-panel-config.json'

export default function AuthBrandPanel({ brandHref }) {
  const pathname = usePathname()
  const config = panelConfig[pathname] ?? panelConfig['/']
  const isSignup = pathname.startsWith('/signup')

  return (
    <SignInBrandPanel brandHref={brandHref} headline={config.headline} subtext={config.subtext}>
      {pathname === '/signup' && <SignupPanelSummary />}
      {pathname === '/signup/plan' && <SignupPlanPanelContent />}
      {isSignup && <SignupProgress />}
    </SignInBrandPanel>
  )
}
