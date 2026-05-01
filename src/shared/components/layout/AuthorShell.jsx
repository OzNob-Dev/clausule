import BragIdentitySidebar from '@shared/components/BragIdentitySidebar'
import { PAGE_CONFIG } from '../../../app/(protected)/(author)/authorPageConfig'

const SETTINGS_CONFIG = {
  activePage: 'settings',
  eyebrow: 'Clausule · Settings',
  ariaLabelledby: 'brag-settings-title',
}

export default function AuthorShell({ children, pathname, session = null }) {
  const pageConfig = PAGE_CONFIG[pathname] ?? SETTINGS_CONFIG

  return (
    <div className="be-page flex min-h-screen w-full bg-[var(--canvas)] max-[768px]:flex-col">
      <BragIdentitySidebar
        activePage={pageConfig.activePage}
        activeChildPage={pageConfig.activeChildPage}
        eyebrow={pageConfig.eyebrow}
        ariaLabel="Sidebar navigation"
        profile={session?.profile ?? {}}
      />
      <main className="be-main bss-screen page-enter min-w-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,var(--cl-surface-muted-19)_0%,var(--cl-surface-paper)_100%)]" aria-labelledby={pageConfig.ariaLabelledby}>
        <div className="be-inner bss-page mx-[100px] max-w-[920px] px-8 pb-16 pt-14 max-[768px]:mx-0 max-[768px]:px-5 max-[768px]:pb-20 max-[768px]:pt-8">{children}</div>
      </main>
    </div>
  )
}
