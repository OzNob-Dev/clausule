import SsoProviderIcon from '@shared/components/SsoProviderIcon'
import { getActiveSsoProviders, ssoAuthPath } from '@shared/utils/sso'
import { signupUi } from '@features/signup/components/signupClasses'

export default function SsoButtons({ config }) {
  const enabledProviders = getActiveSsoProviders(config)
  if (!enabledProviders.length) return null

  return (
    <>
      <div className={signupUi.ssoDivider}>
        <div className={signupUi.ssoDividerLine} />
        <span className={signupUi.ssoDividerText}>or continue with</span>
        <div className={signupUi.ssoDividerLine} />
      </div>

      {enabledProviders.map((provider) => (
        <button key={provider.id} type="button" className={signupUi.ssoButton} onClick={() => { window.location.href = ssoAuthPath(provider.id) }}>
          <span className={signupUi.ssoLogo}><SsoProviderIcon provider={provider.id} /></span>
          <span className={signupUi.ssoLabel}>{provider.ctaLabel}</span>
          <span className={signupUi.ssoArrow}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="6 4 10 8 6 12"/></svg>
          </span>
        </button>
      ))}
    </>
  )
}
