'use client'

import BragIdentitySidebar from '@shared/components/BragIdentitySidebar'
import '@brag/styles/brag-shell.css'

export default function AuthorLayout({ children }) {
  return (
    <div className="be-page">
      <BragIdentitySidebar activePage="settings" eyebrow="Clausule · Settings" ariaLabel="Sidebar navigation" />
      <main className="be-main page-enter bss-screen" aria-labelledby="brag-settings-title">
        <div className="be-inner bss-page">
          {children}
        </div>
      </main>
    </div>
  )
}
