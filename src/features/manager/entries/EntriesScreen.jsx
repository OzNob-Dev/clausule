'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@features/manager/components/AppShell'
import { ThinkingDots } from '@shared/components/ui/ThinkingDots'
import { ALL_EMP, SAMPLE_ENTRIES } from '@shared/data/employees'
import { relativeTime } from '@shared/utils/relativeTime'

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
      <div className="flex flex-col h-screen overflow-hidden">

        {/* Search zone */}
        <div className="shrink-0 pt-6 px-8 pb-0 max-sm:px-4 max-sm:pt-4">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="text-[22px] font-black text-tx-1 tracking-[-0.6px] leading-none">Search</div>
              <div className="text-xs text-tx-3 mt-1">Search entries by name, theme, or keyword</div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entries, names, themes…"
              className="w-full bg-[#FAF7F3] border-[1.5px] border-border2 rounded-[var(--r)] py-3 pr-11 pl-3.5 text-base font-medium text-tx-1 outline-none font-sans transition-colors duration-200 focus:border-acc-text"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-tx-4 [&>svg]:w-4 [&>svg]:h-4" aria-label="Search">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/>
              </svg>
            </button>
          </form>

          {searching && (
            <div className="flex items-center gap-2 mt-2.5 text-[11px] font-semibold text-tx-3">
              <ThinkingDots />
              <span>Searching entries…</span>
            </div>
          )}

          <div className="h-[1px] mt-4 bg-border" />
        </div>

        {/* Results / idle area */}
        <div className="flex-1 overflow-y-auto px-8 pb-[60px] max-sm:px-4 max-sm:pb-[60px]">

          {/* Idle state */}
          {!searching && !results && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-tx-3 pt-5 pb-4 px-0">Recent entries</div>
              {SAMPLE_ENTRIES.map((entry) => {
                const emp = ALL_EMP[0]
                return (
                  <div
                    key={entry.id}
                    className="py-5 px-0 border-b border-border cursor-pointer transition-[padding-left] duration-150 hover:pl-[5px]"
                    onClick={() => setSelected(entry)}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-tx-3">
                      <span
                        className="shrink-0 w-[5px] h-[5px] rounded-full"
                        style={{ background: CAT_DOT[entry.cat] || 'var(--blue)' }}
                      />
                      {emp.name} · {relativeTime(entry.date)}
                    </div>
                    <div className="text-[19px] font-extrabold text-tx-1 leading-[1.3] mb-2">{entry.title}</div>
                    <div className="text-[13px] text-tx-2 leading-[1.75]">{entry.body}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Results */}
          {results && !searching && (
            <div>
              <div className="flex items-center justify-between pt-4 pb-2 px-0">
                <div className="text-xs font-semibold text-tx-3">
                  {results.reduce((n, r) => n + r.entries.length, 0)} results for "{query}"
                </div>
                <div className="text-[11px] text-tx-4 italic">Ranked by relevance</div>
              </div>

              {results.map(({ emp, entries, pattern }) => (
                <div key={emp.name} className="mb-6 border-t border-border pt-4">
                  {/* Person header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="flex items-center justify-center shrink-0 w-[34px] h-[34px] rounded-[11px] text-[11px] font-extrabold"
                      style={{ background: emp.avBg, color: emp.avCol }}
                    >
                      {emp.av}
                    </div>
                    <div>
                      <Link href="/profile" className="text-sm font-bold text-tx-1 no-underline">{emp.name}</Link>
                      <div className="text-[11px] text-tx-2 mt-[1px]">{emp.role}</div>
                    </div>
                  </div>

                  {pattern && (
                    <div className="flex items-start gap-2.5 mb-4 bg-acc-bg border border-acc-border rounded-[var(--r)] py-[11px] px-[15px]">
                      <span className="shrink-0 w-[6px] h-[6px] rounded-full bg-acc-text mt-[5px]" />
                      <span className="text-xs font-semibold text-acc-text leading-[1.6]">{pattern}</span>
                    </div>
                  )}

                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="py-[13px] px-0 border-b border-border cursor-pointer transition-[padding-left] duration-150 hover:pl-[6px]"
                      onClick={() => setSelected(entry)}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-tx-3">
                        <span
                          className="shrink-0 w-[5px] h-[5px] rounded-full"
                          style={{ background: CAT_DOT[entry.cat] || 'var(--blue)' }}
                        />
                        {relativeTime(entry.date)}
                      </div>
                      <div className="text-base font-extrabold text-tx-1 mb-1.5">{entry.title}</div>
                      <div className="text-[13px] text-tx-2 leading-[1.75]">{entry.body}</div>
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
