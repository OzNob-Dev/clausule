import { Link } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { relativeTime } from '../../utils/relativeTime'

export function KanbanCard({ emp }) {
  return (
    <Link
      to="/profile"
      className="block bg-card dark:bg-card-dark rounded-clausule p-3.5 mb-2 border border-[rgba(0,0,0,0.07)] hover:border-[rgba(0,0,0,0.14)] transition-colors no-underline"
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <Avatar initials={emp.av} bg={emp.avBg} color={emp.avCol} size="sm" />
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-tp dark:text-tp-dark truncate">{emp.name}</div>
          <div className="text-[11px] text-tm dark:text-[#6B6B68] mt-0.5">{emp.role} · {emp.team}</div>
        </div>
      </div>
      <div className="h-px bg-[rgba(0,0,0,0.07)] mb-2.5" />
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-tm dark:text-[#6B6B68]">{relativeTime(emp.last)}</span>
        <span className="text-[11px] text-tm dark:text-[#6B6B68]">{emp.entries} entries</span>
      </div>
    </Link>
  )
}
