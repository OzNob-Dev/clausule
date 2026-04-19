'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@shared/components/layout/AppShell'
import { KanbanBoard } from '@features/manager/dashboard/KanbanBoard'
import { ALL_EMP } from '@shared/data/employees'
import '@features/manager/styles/dashboard.css'

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
      <div className="db-page">
        {/* Top bar */}
        <div className="db-topbar">
          <div>
            <div className="db-title">Dashboard</div>
            <div className="db-subtitle">Acme Corp · April 2026</div>
          </div>
          <Link href="/new-entry" className="db-btn-new">
            + New entry
          </Link>
        </div>

        {/* Stats strip + inline search */}
        <div className="db-stats">
          {STATS.map(({ n, l }) => (
            <div key={l} className="db-stat">
              <div className="db-stat__n">{n}</div>
              <div className="db-stat__l">{l}</div>
            </div>
          ))}
          <div className="db-stat db-stat--search">
            <label className="db-search-wrap" htmlFor="db-search">
              <svg className="db-search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="4.5"/>
                <path d="M10.5 10.5l3 3"/>
              </svg>
              <input
                id="db-search"
                type="search"
                placeholder="Search people…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="db-search"
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
