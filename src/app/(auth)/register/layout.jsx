import SignupShell from '@shared/components/layout/SignupShell'

export default function RegisterLayout({ children }) {
  return <SignupShell pathname="/register">{children}</SignupShell>
}
