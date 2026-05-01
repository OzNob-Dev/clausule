import { ArrowIcon } from '@shared/components/ui/icon/ArrowIcon'
import { SsoProviderIcon } from '@shared/components/ui/icon/SsoProviderIcon'
import { Link } from './Link'
import { ssoAuthPath } from '@shared/utils/sso'
export function SsoProviderButton({ provider }) {
  return (
    <Link href={ssoAuthPath(provider.id)} external variant="button" className="su-sso-provider mb-2.5 flex w-full items-center justify-start gap-3 rounded-[var(--su-r)] border-[1.5px] border-[var(--su-border-em)] bg-[var(--su-canvas)] px-4 py-3 text-left [font-family:var(--su-font)] text-[var(--cl-text-base)] font-bold text-[var(--su-tx1)] shadow-none transition-[background,border-color] duration-150 last:mb-0 hover:bg-[var(--su-panel)] hover:border-[var(--cl-border-dark-6)] hover:opacity-100 hover:translate-y-0">
      <span className="su-sso-logo flex h-[22px] w-[22px] shrink-0 items-center justify-center"><SsoProviderIcon provider={provider.id} /></span>
      <span className="su-sso-label flex-1">{provider.ctaLabel}</span>
      <span className="su-sso-arrow text-[var(--su-tx4)]" aria-hidden="true"><ArrowIcon /></span>
    </Link>
  )
}
