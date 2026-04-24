import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@features/auth/context/AuthContext'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { apiFetch, jsonRequest } from '@shared/utils/api'

export function useProfileSave({ current, emailChanged, commitBaseline }) {
  const router         = useRouter()
  const { updateUser } = useAuth()
  const setProfile     = useProfileStore((s) => s.setProfile)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const patchProfile = async ({ emailVerificationCode, mobileConfirmed, mobileConfirmation }) => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const response = await apiFetch('/api/auth/profile', jsonRequest({
        ...current,
        emailVerificationCode,
        mobileConfirmed,
        mobileConfirmation,
      }, { method: 'PATCH' }))
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to save profile')
      setProfile(data.profile)
      updateUser({ email: data.user?.email ?? current.email })
      commitBaseline(current)
      setSuccess('Profile saved')
      if (emailChanged) {
        await fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' })
      }
      router.refresh()
    } catch (err) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return { saving, error, setError, success, patchProfile }
}
