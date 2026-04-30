'use client'

import { usePathname } from 'next/navigation'
import BragIdentitySidebar from '@brag/components/BragIdentitySidebar'
import PageShell from '@shared/components/layout/PageShell'
import '@brag/styles/brag-shell.css'

const PAGE_CONFIG = {
  '/brag': { activePage: 'brag', eyebrow: 'Clausule', ariaLabelledby: 'brag-page-title' },
  '/brag/resume': { activePage: 'brag', activeChildPage: 'resume', eyebrow: 'Clausule · Brag doc', ariaLabelledby: 'brag-page-title' },
  '/brag/linkedin': { activePage: 'brag', activeChildPage: 'linkedin', eyebrow: 'Clausule · Brag doc', ariaLabelledby: 'linkedin-import-title' },
  '/brag/feedback': { activePage: 'feedback', eyebrow: 'Clausule · Feedback', ariaLabelledby: 'feedback-page-title' },
  '/brag/feedback/history': { activePage: 'feedback', activeChildPage: 'feedback-history', eyebrow: 'Clausule · Feedback', ariaLabelledby: 'feedback-history-title' },
  '/profile': { activePage: 'profile', eyebrow: 'Clausule · Profile', ariaLabelledby: 'profile-page-title' },
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
      <PageShell mainClassName="page-enter bss-screen" innerClassName="bss-page" ariaLabelledby={pageConfig.ariaLabelledby}>
        {children}
      </PageShell>
    </div>
  )
}
