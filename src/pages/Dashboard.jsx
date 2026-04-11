import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { KanbanBoard } from '../components/dashboard/KanbanBoard'
import { ALL_EMP } from '../data/employees'

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
      <div className="p-8">
        {/* Top bar */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[20px] font-medium text-tp dark:text-tp-dark tracking-[-0.3px]">Dashboard</h1>
            <p className="text-[13px] text-tm dark:text-[#6B6B68] mt-0.5">Acme Corp · April 2026</p>
          </div>
          <Link
            to="/new-entry"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-nav text-[#E8ECF8] text-[13px] font-medium rounded-clausule hover:opacity-90 transition-opacity no-underline"
          >
            + New entry
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STATS.map(({ n, l }) => (
            <div key={l} className="bg-card dark:bg-card-dark rounded-clausule p-4 border border-[rgba(0,0,0,0.07)]">
              <div className="text-[24px] font-medium text-tp dark:text-tp-dark tracking-tight">{n}</div>
              <div className="text-[12px] text-tm dark:text-[#6B6B68] mt-1">{l}</div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-[rgba(0,0,0,0.07)] mb-5" />

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-60 px-3 py-2 text-[13px] bg-card dark:bg-card-dark border border-[rgba(0,0,0,0.09)] dark:border-[rgba(255,255,255,0.08)] rounded-clausule text-tp dark:text-tp-dark placeholder:text-tm outline-none focus:border-bl transition-colors"
          />
        </div>

        {/* Kanban */}
        <KanbanBoard employees={filtered} />
      </div>
    </AppShell>
  )
}
