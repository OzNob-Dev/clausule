import { storage } from '../utils/storage'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const navigate = useNavigate()

  const signIn = (role) => {
    storage.setAuthed()
    storage.setRole(role)
    navigate(role === 'employee' ? '/brag' : '/dashboard')
  }

  const logout = () => {
    storage.clearAuth()
    navigate('/')
  }

  return {
    isAuthed: storage.isAuthed(),
    role: storage.getRole(),
    signIn,
    logout,
  }
}
