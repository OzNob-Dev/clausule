import './SsoStatusSection.css'

import { getActiveSsoProviders } from '@shared/utils/sso'

export default function SsoStatusSection({ avatarInitials, displayName, email, config }) {
  const providers = getActiveSsoProviders(config)
  if (!providers.length) return null

  return (
    <section className="bss-sso" aria-labelledby="sso-status-title">
      <h3 id="sso-status-title" className="bss-sso-title">Single sign-on</h3>
      <div className="bss-sso-list">
        {providers.map((provider) => (
          <div key={provider.id} className="bss-sso-row">
            <div className="bss-sso-avatar" aria-hidden="true">{avatarInitials}</div>
            <div className="bss-sso-copy">
              <div className="bss-sso-name">{displayName}</div>
              <div className="bss-sso-email">{email}</div>
            </div>
            <div className="bss-sso-provider">{provider.name}</div>
            <div className="bss-sso-state" role="status" aria-label={`${provider.name} single sign-on is active`}>Active</div>
          </div>
        ))}
      </div>
    </section>
  )
}
