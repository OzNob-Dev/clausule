import SsoProviderIcon from '@shared/components/SsoProviderIcon'
import { getActiveSsoProviders, ssoAuthPath } from '@shared/utils/sso'

export default function SsoButtons({ config }) {
  const enabledProviders = getActiveSsoProviders(config)
  if (!enabledProviders.length) return null

  return (
    <>
      <div className="si-divider">
        <div className="si-divider-line" />
        <span className="si-divider-text">or continue with</span>
        <div className="si-divider-line" />
      </div>

      {enabledProviders.map((provider) => (
        <button key={provider.id} type="button" className="si-btn-sso" onClick={() => { window.location.href = ssoAuthPath(provider.id) }}>
          <span className="si-sso-logo"><SsoProviderIcon provider={provider.id} /></span>
          <span className="si-sso-label">{provider.ctaLabel}</span>
          <span className="si-sso-arrow">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="6 4 10 8 6 12"/></svg>
          </span>
        </button>
      ))}
    </>
  )
}
