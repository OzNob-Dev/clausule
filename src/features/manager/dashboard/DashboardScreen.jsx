'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@features/manager/components/AppShell'
import { KanbanBoard } from '@features/manager/dashboard/KanbanBoard'
import { ALL_EMP } from '@shared/data/employees'

const STATS = [
  { n: '84',  l: 'Total entries' },
  { n: '23',  l: 'People tracked' },
  { n: '3',   l: 'Escalated' },
  { n: '3.6', l: 'Avg entries / person' },
]

export default function Dashboard() {
  const [query, setQuery] = useState('')
  const filtered = query
    ? ALL_EMP.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
    : ALL_EMP

  return (
    <AppShell>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <div className="flex items-end justify-between shrink-0 pt-[22px] px-7 pb-0 max-sm:px-4 max-sm:pt-4 max-sm:flex-wrap max-sm:gap-2.5">
          <div>
            <div className="text-[22px] font-black text-tx-1 tracking-[-0.6px]">Dashboard</div>
            <div className="text-xs font-medium text-tx-3 mt-[3px]">Acme Corp · April 2026</div>
          </div>
          <Link href="/new-entry" className="bg-acc text-bg-doc rounded-[var(--r)] text-xs font-bold py-[9px] px-4 no-underline transition-opacity duration-150 hover:opacity-90">
            + New entry
          </Link>
        </div>

        {/* Stats strip + inline search */}
        <div className="flex items-stretch shrink-0 border-b border-border mt-[18px]">
          {STATS.map(({ n, l }) => (
            <div key={l} className="py-[14px] px-6 border-r border-border last:border-r-0 max-sm:py-3 max-sm:px-4">
              <div className="text-[28px] font-black text-tx-1 tracking-[-1px] leading-none max-sm:text-[22px]">{n}</div>
              <div className="text-[11px] font-medium text-tx-3 mt-1">{l}</div>
            </div>
          ))}
          <div className="py-[14px] px-6 border-r border-border last:border-r-0 ml-auto border-r-0 flex items-center max-sm:ml-0 max-sm:border-l-0 max-sm:w-full max-sm:py-3 max-sm:px-4">
            <label className="flex items-center gap-[7px] bg-[#FAF7F3] border-[1.5px] border-border2 rounded-[var(--r)] py-[7px] px-[11px] transition-colors duration-150 cursor-text focus-within:border-acc-text max-sm:w-full" htmlFor="db-search">
              <svg className="shrink-0 w-[13px] h-[13px] text-tx-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="4.5"/>
                <path d="M10.5 10.5l3 3"/>
              </svg>
              <input
                id="db-search"
                type="search"
                placeholder="Search people…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-[160px] bg-transparent border-none p-0 text-xs font-medium text-tx-1 outline-none font-sans placeholder:text-tx-3 [&::-webkit-search-cancel-button]:cursor-pointer max-sm:w-full"
              />
            </label>
          </div>
        </div>

        {/* Kanban */}
        <KanbanBoard employees={filtered} />
      </div>
    </AppShell>
  )
}
