export default function BragIdentitySidebar({
  ariaLabel = 'Profile',
  eyebrow = 'Clausule',
  avatarInitials,
  displayName,
  email,
  noteLabel,
  note,
  overviewLabel,
  status,
  statusSub,
  legendTitle,
  legendItems = [],
}) {
  return (
    <aside className="be-identity be-sidebar" aria-label={ariaLabel}>
      <div className="be-sidebar-header">
        <div className="be-sidebar-eyebrow">{eyebrow}</div>
      </div>
      <div className="be-sidebar-body">
        <div>
          <div key={avatarInitials} className="be-sidebar-avatar be-avatar-pop" aria-hidden="true">
            {avatarInitials}
          </div>
          <div className="be-sidebar-name">{displayName}</div>
          <div className="be-sidebar-role">{email}</div>
        </div>

        {note && (
          <>
            <div className="be-divider" role="separator" />
            <div>
              {noteLabel && <div className="be-notes-label">{noteLabel}</div>}
              <p className="be-note-quote">{note}</p>
            </div>
          </>
        )}

        {overviewLabel && status && (
          <>
            <div className="be-divider" role="separator" />
            <div>
              <div className="be-overview-label">{overviewLabel}</div>
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
                  <div className="be-overview-status">{status}</div>
                  {statusSub && <div className="be-overview-sub">{statusSub}</div>}
                </div>
              </div>
              {legendItems.length > 0 && (
                <ul className="be-ring-legend" aria-label={legendTitle}>
                  {legendItems.map((item) => (
                    <li key={item.label} className={`be-ring-leg${item.missing ? ' be-ring-leg--missing' : ''}`}>
                      <span className={`be-ring-leg-dot${item.missing ? ' be-ring-leg-dot--missing' : ''}`} style={{ background: item.color }} aria-hidden="true" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
