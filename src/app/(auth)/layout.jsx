import { AuthProvider } from '@auth/context/AuthContext'
import DevAccessGate from '@shared/components/layout/DevAccessGate'

export default function AuthLayout({ children }) {
  return (
    <AuthProvider initialSession={null}>
      <DevAccessGate>{children}</DevAccessGate>
    </AuthProvider>
  )
}
