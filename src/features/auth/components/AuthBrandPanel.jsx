'use client'

import { usePathname } from 'next/navigation'
import SignInBrandPanel from './SignInBrandPanel'
import SignupPanelSummary from '@features/signup/components/SignupPanelSummary'
import SignupPlanPanelContent from '@features/signup/components/SignupPlanPanelContent'
import panelConfig from '@features/auth/brand-panel-config.json'

export default function AuthBrandPanel({ brandHref }) {
  const pathname = usePathname()
  const config = panelConfig[pathname] ?? panelConfig['/']

  return (
    <SignInBrandPanel
      brandHref={brandHref}
      headline={config.headline}
      subtext={config.subtext}
    >
      {pathname === '/signup' && <SignupPanelSummary />}
      {pathname === '/signup/plan' && <SignupPlanPanelContent />}
    </SignInBrandPanel>
  )
}
