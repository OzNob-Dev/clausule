'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuth } from '@auth/context/AuthContext'
import { useProfileStore } from '@auth/store/useProfileStore'
import { apiFetch } from '@shared/utils/api'
import type { Role } from '@shared/types/contracts'
import { saveProfileAction } from '@actions/account-actions'
import type { ProfileFormValues } from './useProfileForm'

type SaveProfileInput = {
  emailVerificationCode?: string
  mobileConfirmed?: boolean
  mobileConfirmation?: string
}

type SaveProfileResponse = {
  ok: true
  user: {
    id: string
    email: string
    role: Role
  }
  profile: ProfileFormValues
}

type UseProfileSaveProps = {
  current: ProfileFormValues
  emailChanged: boolean
  commitBaseline: (next: ProfileFormValues) => void
}

export function useProfileSave({ current, emailChanged, commitBaseline }: UseProfileSaveProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { updateUser } = useAuth()
  const setProfile = useProfileStore((s) => s.setProfile)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const patchProfileMutation = useMutation<SaveProfileResponse, Error, SaveProfileInput>({
    mutationFn: async ({ emailVerificationCode, mobileConfirmed, mobileConfirmation }) =>
      saveProfileAction({
        ...current,
        emailVerificationCode,
        mobileConfirmed,
        mobileConfirmation,
      }, current) as Promise<SaveProfileResponse>,
    retry: false,
  })

  const patchProfile = async ({ emailVerificationCode, mobileConfirmed, mobileConfirmation }: SaveProfileInput) => {
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
