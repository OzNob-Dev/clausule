/**
 * Shared profile display helpers used across brag, settings, and account features.
 */

/**
 * @param {{ firstName?: string, lastName?: string }} profile
 * @returns {string}
 */
export function profileDisplayName(profile) {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || 'Your profile'
}

/**
 * @param {{ firstName?: string, lastName?: string, email?: string }} profile
 * @returns {string}
 */
export function profileInitials(profile) {
  return (
    ((profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')).toUpperCase() ||
    profile.email?.[0]?.toUpperCase() ||
    '?'
  )
}
