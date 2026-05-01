'use client'

import { usePathname } from 'next/navigation'
import BragIdentitySidebar from '@shared/components/BragIdentitySidebar'
import DevLoadingOverlayFlag from '@shared/components/ui/DevLoadingOverlayFlag'
import { PAGE_CONFIG } from './authorPageConfig'
import '@brag/styles/brag-shell.css'

export default function AuthorLayout({ children }) {
  const pathname = usePathname()
  const pageConfig = PAGE_CONFIG[pathname] ?? PAGE_CONFIG['/brag']

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
