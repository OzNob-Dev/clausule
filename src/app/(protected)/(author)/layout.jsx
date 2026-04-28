'use client'

import { usePathname } from 'next/navigation'
import BragIdentitySidebar from '@features/brag/components/BragIdentitySidebar'
import '@features/brag/styles/brag-shell.css'

const PAGE_CONFIG = {
  '/brag': { activePage: 'brag', eyebrow: 'Clausule' },
  '/brag/feedback': { activePage: 'feedback', eyebrow: 'Clausule · Feedback' },
  '/profile': { activePage: 'profile', eyebrow: 'Clausule · Profile' },
}

export default function AuthorLayout({ children }) {
  const pathname = usePathname()
  const pageConfig = PAGE_CONFIG[pathname] ?? PAGE_CONFIG['/brag']

  return (
    <div className="be-page">
      <BragIdentitySidebar activePage={pageConfig.activePage} eyebrow={pageConfig.eyebrow} ariaLabel="Sidebar navigation" />
      {children}
    </div>
  )
}
