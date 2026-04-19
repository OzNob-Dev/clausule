export const SSO_PROVIDERS = [
  { id: 'google', name: 'Google', ctaLabel: 'Continue with Google' },
  { id: 'microsoft', name: 'Microsoft', ctaLabel: 'Continue with Microsoft' },
  { id: 'apple', name: 'Apple', ctaLabel: 'Continue with Apple' },
]

export const ssoConfigFromEnv = {
  get google()    { return process.env.NEXT_PUBLIC_SSO_GOOGLE_ENABLED    === 'true' },
  get microsoft() { return process.env.NEXT_PUBLIC_SSO_MICROSOFT_ENABLED === 'true' },
  get apple()     { return process.env.NEXT_PUBLIC_SSO_APPLE_ENABLED     === 'true' },
}

export function getActiveSsoProviders(config = ssoConfigFromEnv) {
  return SSO_PROVIDERS.filter((provider) => config[provider.id])
}

export function ssoAuthPath(providerId) {
  return `/api/auth/sso/${providerId}`
}
