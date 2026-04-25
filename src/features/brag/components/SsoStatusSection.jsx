'use client'

import { SsoProviderIcon } from '@shared/components/SsoProviderIcon'
import { getActiveSsoProviders } from '@shared/utils/sso'

export default function SsoStatusSection({ displayName, email, avatarInitials, config }) {
  const activeSsoProviders = getActiveSsoProviders(config)

  if (!activeSsoProviders.length) return null

  return (
    <>
      <div className="bss-section-label">Single sign-on</div>
      <div className="bss-card bss-sso-card">
        {activeSsoProviders.map((provider) => (
          <div className="bss-sso-row" key={provider.id}>
            <div className="bss-sso-avatar" aria-hidden="true">{avatarInitials}</div>
            <div className="bss-sso-info">
              <div className="bss-sso-name">{displayName}</div>
              <div className="bss-sso-meta">
                <span className="bss-sso-provider">
                  <span className="bss-sso-logo"><SsoProviderIcon provider={provider.id} /></span>
                  {provider.name}
                </span>
                <span aria-hidden="true">·</span>
                <span>{email}</span>
              </div>
            </div>
            <span className="bss-sso-status" aria-label={`${provider.name} single sign-on is active`}>Active</span>
          </div>
        ))}
      </div>
    </>
  )
}
