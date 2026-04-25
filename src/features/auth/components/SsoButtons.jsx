import { getActiveSsoProviders } from '@shared/utils/sso'
import { SsoProviderButton } from './SsoProviderButton'

export default function SsoButtons({ config }) {
  const enabledProviders = getActiveSsoProviders(config)
  if (!enabledProviders.length) return null

  return (
    <>
      <div className="su-sso-divider">
        <div className="su-sso-divider-line" />
        <span className="su-sso-divider-text">or continue with</span>
        <div className="su-sso-divider-line" />
      </div>

      {enabledProviders.map((provider) => (
        <SsoProviderButton key={provider.id} provider={provider} />
      ))}
    </>
  )
}
