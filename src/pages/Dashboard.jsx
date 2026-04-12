import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { KanbanBoard } from '../components/dashboard/KanbanBoard'
import { ALL_EMP } from '../data/employees'
import '../styles/dashboard.css'

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
          <Link to="/new-entry" className="db-btn-new">
            + New entry
          </Link>
        </div>

        {/* Stats strip */}
        <div className="db-stats">
          {STATS.map(({ n, l }) => (
            <div key={l} className="db-stat">
              <div className="db-stat__n">{n}</div>
              <div className="db-stat__l">{l}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="db-search-wrap">
          <input
            type="text"
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="db-search"
          />
        </div>

        {/* Kanban */}
        <KanbanBoard employees={filtered} />
      </div>
    </AppShell>
  )
}
