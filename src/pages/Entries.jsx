import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Avatar } from '../components/ui/Avatar'
import { CategoryPill } from '../components/ui/CategoryPill'
import { ThinkingDots } from '../components/ui/ThinkingDots'
import { ALL_EMP, SAMPLE_ENTRIES } from '../data/employees'
import { relativeTime } from '../utils/relativeTime'

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
      <div className="px-8 py-8">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex items-center gap-3 max-w-2xl">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tm"
                viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
              >
                <circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/>
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search entries, names, themes…"
                className="w-full pl-9 pr-4 py-2.5 bg-card dark:bg-card-dark border border-[rgba(0,0,0,0.09)] dark:border-[rgba(255,255,255,0.08)] rounded-ledger text-[14px] text-tp dark:text-tp-dark placeholder:text-tm outline-none focus:border-bl transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-nav text-[#E8ECF8] text-[13px] font-medium rounded-ledger hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>
        </form>

        {/* Thinking state */}
        {searching && (
          <div className="flex items-center gap-2 text-[13px] text-tm mb-6">
            <ThinkingDots />
            <span>Searching entries…</span>
          </div>
        )}

        {/* Idle state */}
        {!searching && !results && (
          <div>
            <p className="text-[12px] font-medium text-tm uppercase tracking-[0.4px] mb-3">Recent entries</p>
            <div className="flex flex-col gap-2">
              {SAMPLE_ENTRIES.map((entry) => {
                const emp = ALL_EMP[0]
                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelected(entry)}
                    className="flex items-start gap-3 p-3 bg-card dark:bg-card-dark border border-[rgba(0,0,0,0.07)] rounded-ledger cursor-pointer hover:border-[rgba(0,0,0,0.14)] transition-colors"
                  >
                    <Avatar initials={emp.av} bg={emp.avBg} color={emp.avCol} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-medium text-tp dark:text-tp-dark truncate">{entry.title}</span>
                        <CategoryPill cat={entry.cat} showDot={false} />
                      </div>
                      <p className="text-[12px] text-tm dark:text-[#6B6B68]">{emp.name} · {relativeTime(entry.date)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Results */}
        {results && !searching && (
          <div className="flex gap-6">
            {/* Results list */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-tm mb-4">
                Found results for <strong className="text-tp dark:text-tp-dark">"{query}"</strong>
              </p>
              {results.map(({ emp, entries, pattern }) => (
                <div key={emp.name} className="mb-6">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Avatar initials={emp.av} bg={emp.avBg} color={emp.avCol} size="sm" />
                    <Link to="/profile" className="text-[14px] font-medium text-tp dark:text-tp-dark hover:underline">
                      {emp.name}
                    </Link>
                    <span className="text-[12px] text-tm">{emp.role}</span>
                  </div>

                  {pattern && (
                    <div className="ml-[42px] mb-2 flex items-start gap-2 px-3 py-2 bg-blb rounded text-[12px] text-blt">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="8" cy="8" r="6"/><line x1="8" y1="5" x2="8" y2="8"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/>
                      </svg>
                      {pattern}
                    </div>
                  )}

                  <div className="ml-[42px] flex flex-col gap-1.5">
                    {entries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => setSelected(entry)}
                        className={`text-left p-3 rounded-ledger border transition-colors ${
                          selected?.id === entry.id
                            ? 'bg-blb border-bl'
                            : 'bg-card dark:bg-card-dark border-[rgba(0,0,0,0.07)] hover:border-[rgba(0,0,0,0.14)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-medium text-tp dark:text-tp-dark">{entry.title}</span>
                          <CategoryPill cat={entry.cat} showDot={false} />
                        </div>
                        <p className="text-[12px] text-tm">{relativeTime(entry.date)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Detail pane */}
            {selected && (
              <div className="w-72 flex-shrink-0">
                <div className="bg-card dark:bg-card-dark border border-[rgba(0,0,0,0.07)] rounded-ledger p-4 sticky top-8">
                  <div className="flex items-center justify-between mb-3">
                    <CategoryPill cat={selected.cat} />
                    <span className="text-[11px] text-tm">{relativeTime(selected.date)}</span>
                  </div>
                  <h3 className="text-[15px] font-medium text-tp dark:text-tp-dark mb-2">{selected.title}</h3>
                  <p className="text-[13px] text-ts dark:text-[#9A9994] leading-relaxed mb-3">{selected.body}</p>
                  {selected.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selected.tags.map((tag) => (
                        <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(0,0,0,0.05)] text-tm">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
