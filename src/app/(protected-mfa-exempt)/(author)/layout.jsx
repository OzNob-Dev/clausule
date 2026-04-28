'use client'

import BragIdentitySidebar from '@features/brag/components/BragIdentitySidebar'
import '@features/brag/styles/brag-shell.css'

export default function AuthorLayout({ children }) {
  return (
    <div className="be-page">
      <BragIdentitySidebar activePage="settings" eyebrow="Clausule · Settings" ariaLabel="Sidebar navigation" />
      {children}
    </div>
  )
}
