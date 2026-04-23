'use client'

import Link from 'next/link'
import { Avatar } from '@shared/components/ui/Avatar'
import { relativeTime } from '@shared/utils/relativeTime'

export function KanbanCard({ emp }) {
  return (
    <Link href="/profile" className="block no-underline transition-all duration-150 bg-card border border-border rounded-[var(--r2)] py-[14px] px-4 relative mb-[10px] last:mb-0 hover:-translate-y-[2px] hover:bg-canvas hover:border-[#FAF7F3] hover:shadow-[0_4px_16px_rgba(60,45,35,0.07)]">
      <div className="flex items-center gap-2.5 mb-2.5">
        <Avatar initials={emp.av} bg={emp.avBg} color={emp.avCol} size="sm" />
        <div className="min-w-0">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold text-tx-1">{emp.name}</div>
          <div className="text-[11px] text-tx-3 mt-[1px]">{emp.role} · {emp.team}</div>
        </div>
      </div>
      <div className="h-[1px] mb-2.5 bg-border" />
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-tx-3">{relativeTime(emp.last)}</span>
        <span className="text-[11px] font-bold text-tx-3">{emp.entries} entries</span>
      </div>
    </Link>
  )
}
