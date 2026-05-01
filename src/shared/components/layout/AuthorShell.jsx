import BragIdentitySidebar from '@shared/components/BragIdentitySidebar'
import { PAGE_CONFIG } from '../../../app/(protected)/(author)/authorPageConfig'
import '@brag/styles/brag-shell.css'

const SETTINGS_CONFIG = {
  activePage: 'settings',
  eyebrow: 'Clausule · Settings',
  ariaLabelledby: 'brag-settings-title',
}

export default function AuthorShell({ children, pathname, session = null }) {
  const pageConfig = PAGE_CONFIG[pathname] ?? SETTINGS_CONFIG

  return (
    <div className="be-page">
      <BragIdentitySidebar
        activePage={pageConfig.activePage}
        activeChildPage={pageConfig.activeChildPage}
        eyebrow={pageConfig.eyebrow}
        ariaLabel="Sidebar navigation"
        profile={session?.profile ?? {}}
      />
      <main className="be-main page-enter bss-screen" aria-labelledby={pageConfig.ariaLabelledby}>
        <div className="be-inner bss-page">{children}</div>
      </main>
    </div>
  )
}
