export default function BragSidebar({ avatarInitials, displayName, email, managerNote }) {
  return (
    <aside className="be-identity be-sidebar" aria-label="Profile and evidence">
      <div className="be-sidebar-header">
        <div className="be-sidebar-eyebrow">Clausule · Brag doc</div>
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
          <div className="be-notes-label">Manager note</div>
          <p className="be-note-quote">{managerNote}</p>
        </div>

        <div className="be-divider" role="separator" />

        <div>
          <div className="be-overview-label">Evidence strength</div>
          <div className="be-strength-row">
            <div className="be-sidebar-rings" aria-hidden="true">
              <svg width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
                <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" style={{ stroke: 'var(--ring-outer)' }} strokeDasharray="125.7" strokeDashoffset="31" strokeLinecap="round" transform="rotate(-90 25 25)" />
              </svg>
              <svg width="50" height="50" viewBox="0 0 50 50" className="be-sidebar-rings-overlay">
                <circle cx="25" cy="25" r="13" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <circle cx="25" cy="25" r="13" fill="none" strokeWidth="4" style={{ stroke: 'var(--ring-mid)' }} strokeDasharray="81.7" strokeDashoffset="20" strokeLinecap="round" transform="rotate(-90 25 25)" />
              </svg>
              <svg width="50" height="50" viewBox="0 0 50 50" className="be-sidebar-rings-overlay">
                <circle cx="25" cy="25" r="6" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                <circle cx="25" cy="25" r="6" fill="none" strokeWidth="4" style={{ stroke: 'var(--ring-inner)' }} strokeDasharray="37.7" strokeDashoffset="9" strokeLinecap="round" transform="rotate(-90 25 25)" />
              </svg>
            </div>
            <div>
              <div className="be-overview-status">Strong</div>
              <div className="be-overview-sub">3 of 4 types</div>
            </div>
          </div>
          <ul className="be-ring-legend" aria-label="Evidence type breakdown">
            <li className="be-ring-leg">
              <span className="be-ring-leg-dot" style={{ background: 'var(--ring-outer)' }} aria-hidden="true" />
              Work artefacts ✓
            </li>
            <li className="be-ring-leg">
              <span className="be-ring-leg-dot" style={{ background: 'var(--ring-mid)' }} aria-hidden="true" />
              Metrics / data ✓
            </li>
            <li className="be-ring-leg">
              <span className="be-ring-leg-dot" style={{ background: 'var(--ring-inner)' }} aria-hidden="true" />
              Peer recognition ✓
            </li>
            <li className="be-ring-leg be-ring-leg--missing">
              <span className="be-ring-leg-dot be-ring-leg-dot--missing" aria-hidden="true" />
              External links — add one for Exceptional
            </li>
          </ul>
        </div>
      </div>
    </aside>
  )
}
