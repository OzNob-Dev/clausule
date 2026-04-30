'use client'

import { usePathname } from 'next/navigation'
import BragIdentitySidebar from '@shared/components/BragIdentitySidebar'
import LoadingOverlay from '@shared/components/ui/LoadingOverlay'
import { PAGE_CONFIG } from './authorPageConfig'
import '@brag/styles/brag-shell.css'

export default function Loading() {
  const pathname = usePathname()
  const pageConfig = PAGE_CONFIG[pathname] ?? PAGE_CONFIG['/brag']

  return (
    <div className="be-page">
      <BragIdentitySidebar
        activePage={pageConfig.activePage}
        activeChildPage={pageConfig.activeChildPage}
        eyebrow={pageConfig.eyebrow}
        ariaLabel="Sidebar navigation"
        showSignOut={false}
      />
      <main className="be-main page-enter bss-screen" aria-busy="true" aria-labelledby={pageConfig.ariaLabelledby} style={{ position: 'relative' }}>
        <LoadingOverlay />
      </main>
    </div>
  )
}
