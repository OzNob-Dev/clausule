import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Avatar } from '../components/ui/Avatar'
import { ThinkingDots } from '../components/ui/ThinkingDots'
import { ALL_EMP, SAMPLE_ENTRIES } from '../data/employees'
import { relativeTime } from '../utils/relativeTime'
import '../styles/entries.css'

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
      <div className="sr-page">

        {/* Search zone */}
        <div className="sr-top">
          <div className="sr-top-row">
            <div>
              <div className="sr-heading">Search</div>
              <div className="sr-subheading">Search entries by name, theme, or keyword</div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="sr-form">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entries, names, themes…"
              className="sr-input"
            />
            <button type="submit" className="sr-btn-search" aria-label="Search">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/>
              </svg>
            </button>
          </form>

          {searching && (
            <div className="sr-searching">
              <ThinkingDots />
              <span>Searching entries…</span>
            </div>
          )}

          <div className="sr-divider" />
        </div>

        {/* Results / idle area */}
        <div className="sr-area">

          {/* Idle state */}
          {!searching && !results && (
            <div>
              <div className="sr-section-label">Recent entries</div>
              {SAMPLE_ENTRIES.map((entry) => {
                const emp = ALL_EMP[0]
                return (
                  <div
                    key={entry.id}
                    className="sr-entry"
                    onClick={() => setSelected(entry)}
                  >
                    <div className="sr-entry__meta">
                      <span
                        className="sr-entry__dot"
                        style={{ background: CAT_DOT[entry.cat] || 'var(--blue)' }}
                      />
                      {emp.name} · {relativeTime(entry.date)}
                    </div>
                    <div className="sr-entry__title">{entry.title}</div>
                    <div className="sr-entry__body">{entry.body}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Results */}
          {results && !searching && (
            <div>
              <div className="sr-results-header">
                <div className="sr-results-count">
                  {results.reduce((n, r) => n + r.entries.length, 0)} results for "{query}"
                </div>
                <div className="sr-results-rank">Ranked by relevance</div>
              </div>

              {results.map(({ emp, entries, pattern }) => (
                <div key={emp.name} className="sr-person-block">
                  {/* Person header */}
                  <div className="sr-person-header">
                    <div
                      className="sr-avatar"
                      style={{ background: emp.avBg, color: emp.avCol }}
                    >
                      {emp.av}
                    </div>
                    <div>
                      <Link to="/profile" className="sr-person-name">{emp.name}</Link>
                      <div className="sr-person-role">{emp.role}</div>
                    </div>
                  </div>

                  {pattern && (
                    <div className="sr-pattern">
                      <span className="sr-pattern__dot" />
                      <span className="sr-pattern__text">{pattern}</span>
                    </div>
                  )}

                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="sr-result-entry"
                      onClick={() => setSelected(entry)}
                    >
                      <div className="sr-result-entry__meta">
                        <span
                          className="sr-entry__dot"
                          style={{ background: CAT_DOT[entry.cat] || 'var(--blue)' }}
                        />
                        {relativeTime(entry.date)}
                      </div>
                      <div className="sr-result-entry__title">{entry.title}</div>
                      <div className="sr-result-entry__body">{entry.body}</div>
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
