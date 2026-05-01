'use client'

import { usePathname } from 'next/navigation'
import AuthBrandPanel from '@shared/components/ui/AuthBrandPanel'
import BragIdentitySidebar from '@shared/components/BragIdentitySidebar'
import DevLoadingOverlayFlag from '@shared/components/ui/DevLoadingOverlayFlag'
import {
  isAuthShellPath,
  isAuthorShellPath,
  isPublicShellPath,
} from '@shared/utils/routePolicy'
import { PAGE_CONFIG } from '../../../app/(protected)/(author)/authorPageConfig'
import '@signup/styles/signup-theme.css'
import '@signup/styles/signup-form.css'
import '@brag/styles/brag-shell.css'

const SETTINGS_CONFIG = {
  activePage: 'settings',
  eyebrow: 'Clausule · Settings',
  ariaLabelledby: 'brag-settings-title',
}

function AuthShell({ children }) {
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

function PublicShell({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,var(--cl-accent-soft-4),transparent_28%),linear-gradient(180deg,var(--cl-surface-paper-2)_0%,var(--cl-surface-warm)_100%)] text-tp">
      {children}
    </div>
  )
}

function AuthorShell({ children, pathname }) {
  const pageConfig = PAGE_CONFIG[pathname] ?? SETTINGS_CONFIG

  return (
    <div className="be-page">
      <BragIdentitySidebar
        activePage={pageConfig.activePage}
        activeChildPage={pageConfig.activeChildPage}
        eyebrow={pageConfig.eyebrow}
        ariaLabel="Sidebar navigation"
      />
      <main className="be-main page-enter bss-screen" aria-labelledby={pageConfig.ariaLabelledby}>
        <div className="be-inner bss-page">
          <DevLoadingOverlayFlag>{children}</DevLoadingOverlayFlag>
        </div>
      </main>
    </div>
  )
}

export default function RouteShell({ children, initialPathname = '/' }) {
  const pathname = usePathname() ?? initialPathname

  if (isAuthShellPath(pathname)) return <AuthShell>{children}</AuthShell>
  if (isAuthorShellPath(pathname)) return <AuthorShell pathname={pathname}>{children}</AuthorShell>
  if (isPublicShellPath(pathname)) return <PublicShell>{children}</PublicShell>

  return children
}
