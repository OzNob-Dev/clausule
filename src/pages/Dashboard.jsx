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
      <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Top bar */}
        <div className="flex items-end justify-between flex-shrink-0" style={{ padding: '22px 28px 0' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--tx-1)', letterSpacing: '-0.6px' }}>Dashboard</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--tx-3)', marginTop: '3px' }}>Acme Corp · April 2026</div>
          </div>
          <Link
            to="/new-entry"
            className="no-underline transition-opacity hover:opacity-90"
            style={{
              background: 'var(--acc)',
              color: 'var(--tx-1)',
              borderRadius: 'var(--r)',
              fontSize: '12px',
              fontWeight: 700,
              padding: '9px 16px',
            }}
          >
            + New entry
          </Link>
        </div>

        {/* Stats strip */}
        <div className="flex items-stretch flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', marginTop: '18px' }}>
          {STATS.map(({ n, l }, i) => (
            <div
              key={l}
              style={{
                padding: '14px 24px',
                borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--tx-1)', letterSpacing: '-1px', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--tx-3)', marginTop: '4px' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex-shrink-0" style={{ padding: '14px 28px 0' }}>
          <input
            type="text"
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '220px',
              background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid var(--border2)',
              borderRadius: 'var(--r)',
              padding: '8px 13px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--tx-1)',
              outline: 'none',
              fontFamily: 'var(--font)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--acc-text)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border2)' }}
          />
        </div>

        {/* Kanban */}
        <KanbanBoard employees={filtered} />
      </div>
    </AppShell>
  )
}
