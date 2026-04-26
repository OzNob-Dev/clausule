// @ts-check
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuth } from '@features/auth/context/AuthContext'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { apiFetch, apiJson, jsonRequest } from '@shared/utils/api'

/** @param {{ current: Record<string, string>, emailChanged: boolean, commitBaseline: (next: Record<string, string>) => void }} props */
export function useProfileSave({ current, emailChanged, commitBaseline }) {
  const router         = useRouter()
  const queryClient    = useQueryClient()
  const { updateUser } = useAuth()
  const setProfile     = useProfileStore((s) => s.setProfile)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const patchProfileMutation = useMutation({
    mutationFn: (/** @type {{ emailVerificationCode?: string, mobileConfirmed?: boolean, mobileConfirmation?: string }} */ { emailVerificationCode, mobileConfirmed, mobileConfirmation }) =>
      apiJson('/api/auth/profile', jsonRequest({
        ...current,
        emailVerificationCode,
        mobileConfirmed,
        mobileConfirmation,
      }, { method: 'PATCH' })),
    retry: false,
  })

  const patchProfile = async (/** @type {{ emailVerificationCode?: string, mobileConfirmed?: boolean, mobileConfirmation?: string }} */ { emailVerificationCode, mobileConfirmed, mobileConfirmation }) => {
    setError('')
    setSuccess('')
    try {
      const data = await patchProfileMutation.mutateAsync({ emailVerificationCode, mobileConfirmed, mobileConfirmation })
      const nextProfile = data.profile ?? current
      setProfile(nextProfile)
      queryClient.setQueryData(['profile'], nextProfile)
      updateUser({ email: data.user?.email ?? nextProfile.email ?? current.email })
      commitBaseline(nextProfile)
      setSuccess('Profile saved')
      if (emailChanged) {
        await apiFetch('/api/auth/refresh', { method: 'POST' }, { retryOnUnauthorized: false })
      }
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
      router.refresh()
      return nextProfile
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Failed to save profile')
      return null
    }
  }

  return { saving: patchProfileMutation.isPending, error, setError, success, patchProfile }
}
