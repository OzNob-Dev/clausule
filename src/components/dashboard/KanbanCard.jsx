import { Link } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { relativeTime } from '../../utils/relativeTime'

export function KanbanCard({ emp }) {
  return (
    <Link
      to="/profile"
      className="block rounded-clausule2 p-3.5 mb-2 transition-colors no-underline"
      style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <Avatar initials={emp.av} bg={emp.avBg} color={emp.avCol} size="sm" />
        <div className="min-w-0">
          <div className="text-[13px] font-bold truncate" style={{ color: 'var(--tp)' }}>{emp.name}</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'var(--ts)' }}>{emp.role} · {emp.team}</div>
        </div>
      </div>
      <div className="h-px mb-2.5" style={{ background: 'var(--rule)' }} />
      <div className="flex items-center justify-between">
        <span className="text-[11px]" style={{ color: 'var(--tm)' }}>{relativeTime(emp.last)}</span>
        <span className="text-[11px]" style={{ color: 'var(--tm)' }}>{emp.entries} entries</span>
      </div>
    </Link>
  )
}
