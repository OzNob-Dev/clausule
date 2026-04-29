import type { Profile } from '@shared/types/contracts'

type ProfileNameLike = Partial<Pick<Profile, 'firstName' | 'lastName' | 'email'>>

export function profileDisplayName(profile: ProfileNameLike) {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || 'Your profile'
}

export function profileInitials(profile: ProfileNameLike) {
  return (
    ((profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')).toUpperCase() ||
    profile.email?.[0]?.toUpperCase() ||
    '?'
  )
}
