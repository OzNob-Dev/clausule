import { getActiveSsoProviders } from '@shared/utils/sso'
import { SsoProviderButton } from './SsoProviderButton'
export default function SsoButtons({ config }) {
  const enabledProviders = getActiveSsoProviders(config)
  if (!enabledProviders.length) return null

  return (
    <>
      <div className="su-sso-divider my-[22px] flex items-center gap-3">
        <div className="su-sso-divider-line h-px flex-1 bg-[var(--su-border-em)]" />
        <span className="su-sso-divider-text whitespace-nowrap text-[var(--cl-text-xs)] font-bold text-[var(--su-tx4)]">or continue with</span>
        <div className="su-sso-divider-line h-px flex-1 bg-[var(--su-border-em)]" />
      </div>

      {enabledProviders.map((provider) => (
        <SsoProviderButton key={provider.id} provider={provider} />
      ))}
    </>
  )
}
