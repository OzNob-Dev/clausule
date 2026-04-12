import { Link } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { relativeTime } from '../../utils/relativeTime'

export function KanbanCard({ emp }) {
  return (
    <Link
      to="/profile"
      className="block no-underline transition-all duration-150"
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r2)',
        padding: '14px 16px',
        display: 'block',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = 'var(--border2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <Avatar initials={emp.av} bg={emp.avBg} color={emp.avCol} size="sm" />
        <div className="min-w-0">
          <div className="truncate" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--tx-1)' }}>{emp.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--tx-3)', marginTop: '1px' }}>{emp.role} · {emp.team}</div>
        </div>
      </div>
      <div className="h-px mb-2.5" style={{ background: 'var(--border)' }} />
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--tx-3)' }}>{relativeTime(emp.last)}</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tx-3)' }}>{emp.entries} entries</span>
      </div>
    </Link>
  )
}
