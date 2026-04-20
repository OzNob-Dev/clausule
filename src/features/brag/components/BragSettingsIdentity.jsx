export default function BragSettingsIdentity({ avatarInitials, displayName, email }) {
  return (
    <aside className="be-identity be-sidebar" aria-label="Profile">
      <div className="be-sidebar-header">
        <div className="be-sidebar-eyebrow">Clausule · Settings</div>
      </div>
      <div className="be-sidebar-body">
        <div>
          <div key={avatarInitials} className="be-sidebar-avatar be-avatar-pop" aria-hidden="true">
            {avatarInitials}
          </div>
          <div className="be-sidebar-name">{displayName}</div>
          <div className="be-sidebar-role">{email}</div>
        </div>
        <div className="be-divider" role="separator" />
        <div>
          <div className="be-notes-label">Account security</div>
          <p className="bss-identity-note">
            Manage two-factor authentication for secure sign-in.
          </p>
        </div>
      </div>
    </aside>
  )
}
