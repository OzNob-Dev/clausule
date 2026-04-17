'use client'

import Link from 'next/link'
import { Avatar } from '../ui/Avatar'
import { relativeTime } from '../../utils/relativeTime'

export function KanbanCard({ emp }) {
  return (
    <Link href="/profile" className="kb-card">
      <div className="kb-card-head">
        <Avatar initials={emp.av} bg={emp.avBg} color={emp.avCol} size="sm" />
        <div className="kb-card-info">
          <div className="kb-card-name">{emp.name}</div>
          <div className="kb-card-role">{emp.role} · {emp.team}</div>
        </div>
      </div>
      <div className="kb-card-rule" />
      <div className="kb-card-foot">
        <span className="kb-card-time">{relativeTime(emp.last)}</span>
        <span className="kb-card-count">{emp.entries} entries</span>
      </div>
    </Link>
  )
}
