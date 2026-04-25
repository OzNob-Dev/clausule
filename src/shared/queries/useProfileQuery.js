// @ts-check
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@shared/utils/api'

export function useProfileQuery(options = {}) {
  return useQuery({
    queryKey: ['profile'],
    retry: false,
    queryFn: async () => {
      const res = await apiFetch('/api/auth/profile')
      if (!res.ok) throw new Error('Failed to load profile')
      return res.json()
    },
    ...options,
  })
}

export function useTotpStatusQuery(options = {}) {
  return useQuery({
    queryKey: ['totp-status'],
    retry: false,
    queryFn: async () => {
      const res = await apiFetch('/api/auth/totp/status')
      if (!res.ok) throw new Error('Failed to load TOTP status')
      return res.json()
    },
    ...options,
  })
}
