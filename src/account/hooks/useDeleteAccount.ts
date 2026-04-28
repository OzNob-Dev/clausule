'use client'

import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@auth/context/AuthContext'
import { deleteAccountAction } from '@actions/account-actions'

export function useDeleteAccount() {
  const { logout } = useAuth()

  const mutation = useMutation({
    mutationFn: async () => {
      await deleteAccountAction()
      await logout()
    },
  })

  return {
    deleteAccount: () => mutation.mutateAsync(),
    deleting: mutation.isPending,
  }
}
