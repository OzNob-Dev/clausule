import { SsoProviderIcon } from '@shared/components/SsoProviderIcon'
import { ssoAuthPath } from '@shared/utils/sso'

function SsoArrow() {
  return (
    <span className="su-sso-arrow" aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 4 10 8 6 12" />
      </svg>
    </span>
  )
}

export function SsoProviderButton({ provider }) {
  return (
    <a href={ssoAuthPath(provider.id)} className="su-sso-provider">
      <span className="su-sso-logo"><SsoProviderIcon provider={provider.id} /></span>
      <span className="su-sso-label">{provider.ctaLabel}</span>
      <SsoArrow />
    </a>
  )
}
