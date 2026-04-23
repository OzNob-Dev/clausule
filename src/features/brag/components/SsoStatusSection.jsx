'use client'

import SsoProviderIcon from '@shared/components/SsoProviderIcon'
import { getActiveSsoProviders, ssoConfigFromEnv } from '@shared/utils/sso'
import { bragSettingsUi } from './bragClasses'

export { getActiveSsoProviders, ssoConfigFromEnv }

export default function SsoStatusSection({ displayName, email, avatarInitials, config }) {
  const activeSsoProviders = getActiveSsoProviders(config)

  if (!activeSsoProviders.length) return null

  return (
    <>
      <div className={bragSettingsUi.sectionLabel}>Single sign-on</div>
      <div className={bragSettingsUi.ssoCard}>
        {activeSsoProviders.map((provider) => (
          <div className={bragSettingsUi.ssoRow} key={provider.id}>
            <div className={bragSettingsUi.ssoAvatar} aria-hidden="true">{avatarInitials}</div>
            <div className={bragSettingsUi.ssoInfo}>
              <div className={bragSettingsUi.ssoName}>{displayName}</div>
              <div className={bragSettingsUi.ssoMeta}>
                <span className={bragSettingsUi.ssoProvider}>
                  <span className={bragSettingsUi.ssoLogo}><SsoProviderIcon provider={provider.id} /></span>
                  {provider.name}
                </span>
                <span aria-hidden="true">·</span>
                <span>{email}</span>
              </div>
            </div>
            <span className={bragSettingsUi.ssoStatus} aria-label={`${provider.name} single sign-on is active`}>Active</span>
          </div>
        ))}
      </div>
    </>
  )
}
