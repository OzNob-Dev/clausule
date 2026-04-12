import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { storage } from '../../utils/storage'

const navItems = [
  {
    to: '/dashboard',
    tip: 'Dashboard',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/>
        <rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/entries',
    tip: 'Search entries',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    to: '/escalated',
    tip: 'Escalated',
    badge: true,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z"/>
      </svg>
    ),
  },
  {
    to: '/settings',
    tip: 'Settings',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="2.5"/>
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/>
      </svg>
    ),
  },
]

export function RailNav() {
  const { toggle } = useTheme()
  const navigate = useNavigate()
  const escalatedCount = storage.getEscalatedCount()

  const logout = () => {
    storage.clearAuth()
    navigate('/')
  }

  return (
    <aside
      className="w-[46px] flex flex-col items-center py-[18px] flex-shrink-0 sticky top-0 h-screen opacity-50 hover:opacity-100 transition-opacity duration-200"
      style={{ background: 'var(--nav)' }}
    >
      {/* Logo */}
      <div
        className="text-[8px] font-bold tracking-[4px] mb-6 select-none"
        style={{ color: 'var(--acc-text)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        CLS
      </div>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map(({ to, tip, icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            title={tip}
            className={({ isActive }) =>
              `relative w-9 h-9 flex items-center justify-center rounded-clausule transition-colors duration-150 ${
                isActive
                  ? 'opacity-100'
                  : 'opacity-45 hover:opacity-100'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? 'var(--nav-active-bg)' : 'transparent',
              color: 'var(--tp)',
            })}
          >
            <span className="w-4 h-4">{icon}</span>
            {badge && escalatedCount > 0 && (
              <span
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--rt)', border: '1.5px solid var(--nav)' }}
              />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={toggle}
          title="Toggle theme"
          className="w-7 h-7 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--tp)' }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z"/>
          </svg>
        </button>

        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold cursor-default"
          style={{ background: 'var(--acc-tint)', color: 'var(--acc-text)' }}
          title="Adrian Diente"
        >
          AD
        </div>

        <button
          onClick={logout}
          title="Sign out"
          className="w-7 h-7 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--tp)' }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3"/>
            <polyline points="11 11 14 8 11 5"/><line x1="14" y1="8" x2="6" y2="8"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}
