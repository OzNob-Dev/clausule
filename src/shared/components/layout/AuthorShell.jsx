import BragIdentitySidebar from '@shared/components/BragIdentitySidebar'
import { PAGE_CONFIG } from '../../../app/(protected)/(author)/authorPageConfig'

const SETTINGS_CONFIG = {
  activePage: 'settings',
  eyebrow: 'Clausule · Settings',
  ariaLabelledby: 'brag-settings-title',
}

export default function AuthorShell({ children, pathname, session = null }) {
  const pageConfig = PAGE_CONFIG[pathname] ?? SETTINGS_CONFIG
  const profile = session?.profile ?? {}
  const userMeta = session?.user?.user_metadata ?? session?.user?.raw_user_meta_data ?? {}
  const identityProfile = {
    ...profile,
    firstName: profile.firstName || profile.first_name || userMeta.first_name || userMeta.firstName || '',
    lastName: profile.lastName || profile.last_name || userMeta.last_name || userMeta.lastName || '',
    email: profile.email || session?.user?.email || '',
  }

  return (
    <div className="be-page flex min-h-screen w-full bg-[var(--canvas)] max-[768px]:flex-col">
      <BragIdentitySidebar
        activePage={pageConfig.activePage}
        activeChildPage={pageConfig.activeChildPage}
        eyebrow={pageConfig.eyebrow}
        ariaLabel="Sidebar navigation"
        profile={identityProfile}
      />
      <main className="be-main bss-screen page-enter min-w-0 flex-1 overflow-y-auto bg-[var(--cl-surface-warm)]" aria-labelledby={pageConfig.ariaLabelledby}>
        <div className="be-inner bss-page mx-[100px] max-w-[920px] px-8 pb-16 pt-14 max-[768px]:mx-0 max-[768px]:px-5 max-[768px]:pb-20 max-[768px]:pt-8">{children}</div>
      </main>
    </div>
  )
}
