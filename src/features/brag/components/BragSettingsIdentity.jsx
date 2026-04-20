import BragIdentitySidebar from '@features/brag/components/BragIdentitySidebar'

export default function BragSettingsIdentity(props) {
  return (
    <BragIdentitySidebar
      ariaLabel="Profile"
      eyebrow="Clausule · Settings"
      noteLabel="Account security"
      note="Manage two-factor authentication for secure sign-in."
      {...props}
    />
  )
}
