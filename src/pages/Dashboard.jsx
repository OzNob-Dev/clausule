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
            <h1 className="text-[20px] font-black tracking-[-0.3px]" style={{ color: 'var(--tp)' }}>Dashboard</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--tm)' }}>Acme Corp · April 2026</p>
          </div>
          <Link
            to="/new-entry"
            className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-bold rounded-clausule hover:opacity-90 transition-opacity no-underline text-white"
            style={{ background: 'var(--acc)' }}
          >
            + New entry
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STATS.map(({ n, l }) => (
            <div
              key={l}
              className="rounded-clausule2 p-4"
              style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
            >
              <div className="text-[24px] font-black tracking-tight" style={{ color: 'var(--tp)' }}>{n}</div>
              <div className="text-[12px] mt-1 font-bold" style={{ color: 'var(--tm)' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px mb-5" style={{ background: 'var(--rule)' }} />

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-60 px-3 py-2 text-[13px] rounded-clausule outline-none transition-colors"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--rule)',
              color: 'var(--tp)',
            }}
          />
        </div>

        {/* Kanban */}
        <KanbanBoard employees={filtered} />
      </div>
    </AppShell>
  )
}
