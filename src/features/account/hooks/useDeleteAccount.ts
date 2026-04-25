'use client'

import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@features/auth/context/AuthContext'
import { apiFetch } from '@shared/utils/api'

export function useDeleteAccount() {
  const { logout } = useAuth()

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiFetch('/api/account', {
        method: 'DELETE',
      }, { retryOnUnauthorized: false })

      if (!response.ok) throw new Error('Delete failed')
      await logout()
    },
  })

  return {
    deleteAccount: () => mutation.mutateAsync(),
    deleting: mutation.isPending,
  }
}
