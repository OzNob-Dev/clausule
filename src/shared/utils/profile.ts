import type { Profile } from '@shared/types/contracts'

type ProfileNameLike = Partial<Pick<Profile, 'firstName' | 'lastName' | 'email'>>

function emailLabel(email?: string) {
  const value = email?.trim()
  if (!value) return ''
  return value.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || value
}

export function profileDisplayName(profile: ProfileNameLike) {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || emailLabel(profile.email) || 'Your profile'
}

export function profileInitials(profile: ProfileNameLike) {
  return (
    ((profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')).toUpperCase() ||
    profile.email?.[0]?.toUpperCase() ||
    '?'
  )
}
