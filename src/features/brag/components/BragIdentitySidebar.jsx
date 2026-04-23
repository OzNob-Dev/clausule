import { cn } from '@shared/utils/cn'
import { bragShell } from './bragClasses'

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
    <aside className={bragShell.identity} aria-label={ariaLabel}>
      <div className={bragShell.sidebarHeader}>
        <div className={bragShell.sidebarEyebrow}>{eyebrow}</div>
      </div>
      <div className={bragShell.sidebarBody}>
        <div>
          <div key={avatarInitials} className={bragShell.sidebarAvatar} aria-hidden="true">
            {avatarInitials}
          </div>
          <div className={bragShell.sidebarName}>{displayName}</div>
          <div className={bragShell.sidebarRole}>{email}</div>
        </div>

        {note && (
          <>
            <div className={bragShell.divider} role="separator" />
            <div>
              {noteLabel && <div className={bragShell.notesLabel}>{noteLabel}</div>}
              <p className={bragShell.noteQuote}>{note}</p>
            </div>
          </>
        )}

        {overviewLabel && status && (
          <>
            <div className={bragShell.divider} role="separator" />
            <div>
              <div className={bragShell.overviewLabel}>{overviewLabel}</div>
              <div className={bragShell.strengthRow}>
                <div className={bragShell.rings} aria-hidden="true">
                  <svg width="50" height="50" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
                    <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" style={{ stroke: 'var(--ring-outer)' }} strokeDasharray="125.7" strokeDashoffset="31" strokeLinecap="round" transform="rotate(-90 25 25)" />
                  </svg>
                  <svg width="50" height="50" viewBox="0 0 50 50" className={bragShell.ringsOverlay}>
                    <circle cx="25" cy="25" r="13" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                    <circle cx="25" cy="25" r="13" fill="none" strokeWidth="4" style={{ stroke: 'var(--ring-mid)' }} strokeDasharray="81.7" strokeDashoffset="20" strokeLinecap="round" transform="rotate(-90 25 25)" />
                  </svg>
                  <svg width="50" height="50" viewBox="0 0 50 50" className={bragShell.ringsOverlay}>
                    <circle cx="25" cy="25" r="6" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                    <circle cx="25" cy="25" r="6" fill="none" strokeWidth="4" style={{ stroke: 'var(--ring-inner)' }} strokeDasharray="37.7" strokeDashoffset="9" strokeLinecap="round" transform="rotate(-90 25 25)" />
                  </svg>
                </div>
                <div>
                  <div className={bragShell.status}>{status}</div>
                  {statusSub && <div className={bragShell.statusSub}>{statusSub}</div>}
                </div>
              </div>
              {legendItems.length > 0 && (
                <ul className={bragShell.ringLegend} aria-label={legendTitle}>
                  {legendItems.map((item) => (
                    <li key={item.label} className={cn(bragShell.ringItem, item.missing && bragShell.ringItemMissing)}>
                      <span className={cn(bragShell.ringDot, item.missing && bragShell.ringDotMissing)} style={{ background: item.color }} aria-hidden="true" />
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
