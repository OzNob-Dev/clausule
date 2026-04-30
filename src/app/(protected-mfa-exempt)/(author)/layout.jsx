'use client'

import BragIdentitySidebar from '@brag/components/BragIdentitySidebar'
import PageShell from '@shared/components/layout/PageShell'
import '@brag/styles/brag-shell.css'

export default function AuthorLayout({ children }) {
  return (
    <div className="be-page">
      <BragIdentitySidebar activePage="settings" eyebrow="Clausule · Settings" ariaLabel="Sidebar navigation" />
      <PageShell mainClassName="page-enter bss-screen" innerClassName="bss-page" ariaLabelledby="brag-settings-title">
        {children}
      </PageShell>
    </div>
  )
}
