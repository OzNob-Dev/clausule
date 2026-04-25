// @ts-check
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuth } from '@features/auth/context/AuthContext'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { apiFetch, apiJson, jsonRequest } from '@shared/utils/api'

export function useProfileSave({ current, emailChanged, commitBaseline }) {
  const router         = useRouter()
  const { updateUser } = useAuth()
  const setProfile     = useProfileStore((s) => s.setProfile)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const patchProfileMutation = useMutation({
    mutationFn: ({ emailVerificationCode, mobileConfirmed, mobileConfirmation }) =>
      apiJson('/api/auth/profile', jsonRequest({
        ...current,
        emailVerificationCode,
        mobileConfirmed,
        mobileConfirmation,
      }, { method: 'PATCH' })),
    retry: false,
  })

  const patchProfile = async ({ emailVerificationCode, mobileConfirmed, mobileConfirmation }) => {
    setError('')
    setSuccess('')
    try {
      const data = await patchProfileMutation.mutateAsync({ emailVerificationCode, mobileConfirmed, mobileConfirmation })
      setProfile(data.profile)
      updateUser({ email: data.user?.email ?? current.email })
      commitBaseline(current)
      setSuccess('Profile saved')
      if (emailChanged) {
        await apiFetch('/api/auth/refresh', { method: 'POST' }, { retryOnUnauthorized: false })
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Failed to save profile')
    }
  }

  return { saving: patchProfileMutation.isPending, error, setError, success, patchProfile }
}
