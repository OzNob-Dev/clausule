import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Avatar } from '../components/ui/Avatar'
import { ThinkingDots } from '../components/ui/ThinkingDots'
import { ALL_EMP, SAMPLE_ENTRIES } from '../data/employees'
import { relativeTime } from '../utils/relativeTime'

const CAT_DOT = {
  perf:    'var(--blue)',
  conduct: 'var(--amber)',
  dev:     'var(--teal)',
}

const MOCK_RESULTS = [
  {
    emp: ALL_EMP[0],
    entries: [SAMPLE_ENTRIES[0], SAMPLE_ENTRIES[3]],
    pattern: 'Strong performance trend — 2 positive entries in the last quarter.',
  },
  {
    emp: ALL_EMP[2],
    entries: [SAMPLE_ENTRIES[2]],
    pattern: null,
  },
]

export default function Entries() {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState(null)
  const [selected, setSelected] = useState(null)

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setResults(null)
    setTimeout(() => {
      setSearching(false)
      setResults(MOCK_RESULTS)
    }, 1200)
  }

  return (
    <AppShell>
      <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>

        {/* Search zone */}
        <div className="flex-shrink-0" style={{ padding: '24px 32px 0' }}>
          <div className="flex items-end justify-between mb-5">
            <div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--tx-1)', letterSpacing: '-0.6px', lineHeight: 1 }}>Search</div>
              <div style={{ fontSize: '12px', color: 'var(--tx-3)', marginTop: '4px' }}>Search entries by name, theme, or keyword</div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entries, names, themes…"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1.5px solid var(--border2)',
                borderRadius: 'var(--r)',
                padding: '12px 44px 12px 14px',
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--tx-1)',
                outline: 'none',
                fontFamily: 'var(--font)',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--acc-text)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border2)' }}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--tx-4)' }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/>
              </svg>
            </button>
          </form>

          {searching && (
            <div className="flex items-center gap-2 mt-2.5" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--tx-3)' }}>
              <ThinkingDots />
              <span>Searching entries…</span>
            </div>
          )}

          <div className="h-px mt-4" style={{ background: 'var(--border)' }} />
        </div>

        {/* Results / idle area */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '0 32px 60px' }}>

          {/* Idle state */}
          {!searching && !results && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--tx-3)', padding: '20px 0 16px' }}>
                Recent entries
              </div>
              {SAMPLE_ENTRIES.map((entry) => {
                const emp = ALL_EMP[0]
                return (
                  <div
                    key={entry.id}
                    className="cursor-pointer transition-all duration-150"
                    style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = '5px' }}
                    onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = '0' }}
                    onClick={() => setSelected(entry)}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5" style={{ fontSize: '11px', color: 'var(--tx-3)' }}>
                      <span
                        className="flex-shrink-0"
                        style={{ width: '5px', height: '5px', borderRadius: '50%', background: CAT_DOT[entry.cat] || 'var(--blue)' }}
                      />
                      {emp.name} · {relativeTime(entry.date)}
                    </div>
                    <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--tx-1)', lineHeight: 1.3, marginBottom: '8px' }}>
                      {entry.title}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--tx-2)', lineHeight: 1.75 }}>
                      {entry.body}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Results */}
          {results && !searching && (
            <div>
              <div className="flex items-center justify-between" style={{ padding: '16px 0 8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx-3)' }}>
                  {results.reduce((n, r) => n + r.entries.length, 0)} results for "{query}"
                </div>
                <div style={{ fontSize: '11px', color: 'var(--tx-4)', fontStyle: 'italic' }}>
                  Ranked by relevance
                </div>
              </div>

              {results.map(({ emp, entries, pattern }) => (
                <div key={emp.name} className="mb-6" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  {/* Person header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: '34px', height: '34px', borderRadius: '11px',
                        background: emp.avBg, color: emp.avCol,
                        fontSize: '11px', fontWeight: 800,
                      }}
                    >
                      {emp.av}
                    </div>
                    <div>
                      <Link to="/profile" className="no-underline" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx-1)' }}>
                        {emp.name}
                      </Link>
                      <div style={{ fontSize: '11px', color: 'var(--tx-2)', marginTop: '1px' }}>{emp.role}</div>
                    </div>
                  </div>

                  {pattern && (
                    <div
                      className="flex items-start gap-2.5 mb-4"
                      style={{
                        background: 'var(--acc-bg)',
                        border: '1px solid var(--acc-border)',
                        borderRadius: 'var(--r)',
                        padding: '11px 15px',
                      }}
                    >
                      <span
                        className="flex-shrink-0 mt-[5px]"
                        style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--acc-text)' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--acc-text)', lineHeight: 1.6 }}>{pattern}</span>
                    </div>
                  )}

                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="cursor-pointer transition-all duration-150"
                      style={{ padding: '13px 0', borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = '6px' }}
                      onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = '0' }}
                      onClick={() => setSelected(entry)}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5" style={{ fontSize: '10px', color: 'var(--tx-3)' }}>
                        <span
                          className="flex-shrink-0"
                          style={{ width: '5px', height: '5px', borderRadius: '50%', background: CAT_DOT[entry.cat] || 'var(--blue)' }}
                        />
                        {relativeTime(entry.date)}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--tx-1)', marginBottom: '6px' }}>{entry.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--tx-2)', lineHeight: 1.75 }}>{entry.body}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
