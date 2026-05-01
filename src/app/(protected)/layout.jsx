import { AppShell } from '@shared/components/layout/AppShell'

export default function ProtectedLayout({ children }) {
  return <AppShell>{children}</AppShell>
}
