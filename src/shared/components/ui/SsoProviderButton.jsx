import { ArrowIcon } from './SignupIcons'
import { SsoProviderIcon } from './SsoProviderIcon'
import { Link } from './Link'
import { ssoAuthPath } from '@shared/utils/sso'

export function SsoProviderButton({ provider }) {
  return (
    <Link href={ssoAuthPath(provider.id)} external variant="button" className="su-sso-provider">
      <span className="su-sso-logo"><SsoProviderIcon provider={provider.id} /></span>
      <span className="su-sso-label">{provider.ctaLabel}</span>
      <span className="su-sso-arrow" aria-hidden="true"><ArrowIcon /></span>
    </Link>
  )
}
