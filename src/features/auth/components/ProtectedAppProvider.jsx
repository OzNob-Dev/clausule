'use client'

import { AuthProvider } from '@features/auth/context/AuthContext'

export default function ProtectedAppProvider({ session, children }) {
  return <AuthProvider initialSession={session}>{children}</AuthProvider>
}
