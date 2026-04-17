import { useRouter } from 'next/navigation'
import { storage } from '../utils/storage'

export function useAuth() {
  const router = useRouter()

  const signIn = (role) => {
    storage.setAuthed()
    storage.setRole(role)
    router.push(role === 'employee' ? '/brag' : '/dashboard')
  }

  const logout = () => {
    storage.clearAuth()
    router.push('/')
  }

  return {
    isAuthed: storage.isAuthed(),
    role: storage.getRole(),
    signIn,
    logout,
  }
}
