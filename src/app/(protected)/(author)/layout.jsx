'use client'

import { usePathname } from 'next/navigation'
import BragIdentitySidebar from '@brag/components/BragIdentitySidebar'
import '@brag/styles/brag-shell.css'

const PAGE_CONFIG = {
  '/brag': { activePage: 'brag', eyebrow: 'Clausule' },
  '/brag/resume': { activePage: 'brag', activeChildPage: 'resume', eyebrow: 'Clausule · Brag doc' },
  '/brag/linkedin': { activePage: 'brag', activeChildPage: 'linkedin', eyebrow: 'Clausule · Brag doc' },
  '/brag/feedback': { activePage: 'feedback', eyebrow: 'Clausule · Feedback' },
  '/brag/feedback/history': { activePage: 'feedback', activeChildPage: 'feedback-history', eyebrow: 'Clausule · Feedback' },
  '/profile': { activePage: 'profile', eyebrow: 'Clausule · Profile' },
}

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
      {children}
    </div>
  )
}
