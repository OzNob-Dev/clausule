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
          <div className="be-sidebar-avatar be-avatar-pop" aria-hidden="true">
            <span className="be-sidebar-avatar-text">{avatarInitials}</span>
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
                    <circle cx="25" cy="25" r="20" fill="none" stroke="var(--ring-outer)" strokeWidth="4" strokeDasharray="125.7" strokeDashoffset="31" strokeLinecap="round" transform="rotate(-90 25 25)" />
                  </svg>
                  <svg width="50" height="50" viewBox="0 0 50 50" className="be-sidebar-rings-overlay">
                    <circle cx="25" cy="25" r="13" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                    <circle cx="25" cy="25" r="13" fill="none" stroke="var(--ring-mid)" strokeWidth="4" strokeDasharray="81.7" strokeDashoffset="20" strokeLinecap="round" transform="rotate(-90 25 25)" />
                  </svg>
                  <svg width="50" height="50" viewBox="0 0 50 50" className="be-sidebar-rings-overlay">
                    <circle cx="25" cy="25" r="6" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                    <circle cx="25" cy="25" r="6" fill="none" stroke="var(--ring-inner)" strokeWidth="4" strokeDasharray="37.7" strokeDashoffset="9" strokeLinecap="round" transform="rotate(-90 25 25)" />
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
                      <span
                        className={`be-ring-leg-dot${item.missing ? ' be-ring-leg-dot--missing' : ''}`}
                        style={{ '--be-ring-leg-color': item.color }}
                        aria-hidden="true"
                      />
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
