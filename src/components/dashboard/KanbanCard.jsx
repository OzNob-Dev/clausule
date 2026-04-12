import { Link } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { relativeTime } from '../../utils/relativeTime'

export function KanbanCard({ emp }) {
  return (
    <Link
      to="/profile"
      className="block no-underline transition-all duration-150 bg-[var(--card)] border border-[var(--border)] rounded-clausule2 p-[14px_16px] relative hover:-translate-y-0.5 hover:border-[var(--border2)]"
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <Avatar initials={emp.av} bg={emp.avBg} color={emp.avCol} size="sm" />
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold text-[var(--tx-1)]">{emp.name}</div>
          <div className="text-[11px] text-[var(--tx-3)] mt-px">{emp.role} · {emp.team}</div>
        </div>
      </div>
      <div className="h-px mb-2.5 bg-[var(--border)]" />
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[var(--tx-3)]">{relativeTime(emp.last)}</span>
        <span className="text-[11px] font-bold text-[var(--tx-3)]">{emp.entries} entries</span>
      </div>
    </Link>
  )
}
