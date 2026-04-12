import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { storage } from '../utils/storage'
import { useTheme } from '../hooks/useTheme'

const MANAGER_SUMMARY = 'Jordan has been a consistent performer this quarter, demonstrating strong technical initiative and meaningful growth in how they communicate in code reviews. One concern was raised and addressed promptly — overall trajectory is positive.'

const INITIAL_BULLETS = [
  'Led authentication refactor across 3 services, reducing latency by 18%',
  'Mentored two new engineers through onboarding — both rated experience 5/5',
  'Drove resolution of critical 3am payment outage; RCA posted within 24h',
]

const MANAGER_NOTES = [
  { date: '2025-10-03', text: 'Volunteered to run onboarding for two new engineers. Showed real leadership potential.' },
  { date: '2025-09-15', text: 'Excellent work on Q3 authentication refactor. Took initiative without being asked.' },
]

export default function BragEmployee() {
  const { toggle } = useTheme()
  const navigate = useNavigate()
  const [tab, setTab] = useState('brag')
  const [bullets, setBullets] = useState(INITIAL_BULLETS)
  const [cvVisible, setCvVisible] = useState(false)
  const [generating, setGenerating] = useState(false)

  const logout = () => {
    storage.clearAuth()
    navigate('/')
  }

  const generateCV = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setCvVisible(true)
    }, 1400)
  }

  const updateBullet = (i, val) => {
    setBullets((prev) => prev.map((b, idx) => (idx === i ? val : b)))
  }

  const addBullet = () => setBullets((prev) => [...prev, ''])
  const removeBullet = (i) => setBullets((prev) => prev.filter((_, idx) => idx !== i))

  return (
    <div className="flex w-full min-h-screen" style={{ background: 'var(--canvas)' }}>
      {/* Employee rail */}
      <aside
        className="w-[46px] flex flex-col items-center py-[18px] flex-shrink-0 sticky top-0 h-screen opacity-[0.55] hover:opacity-100 transition-opacity duration-200"
        style={{ background: 'var(--nav)' }}
      >
        <div
          className="text-[8px] font-bold tracking-[4px] uppercase mb-5 select-none"
          style={{ color: 'var(--acc-text)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          CLS
        </div>
        <nav className="flex-1 flex flex-col items-center gap-1">
          <button
            className="w-[34px] h-[34px] flex items-center justify-center rounded-clausule"
            style={{ background: 'var(--acc-tint)', color: 'var(--tp)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z"/>
            </svg>
          </button>
        </nav>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={toggle}
            className="w-7 h-7 flex items-center justify-center transition-opacity opacity-40 hover:opacity-100"
            style={{ color: 'var(--tp)' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z"/>
            </svg>
          </button>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{ background: 'var(--acc-tint)', color: 'var(--acc-text)' }}
          >
            JE
          </div>
          <button
            onClick={logout}
            className="w-7 h-7 flex items-center justify-center transition-opacity opacity-40 hover:opacity-100 bg-transparent border-0"
            style={{ color: 'var(--tp)' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3"/>
              <polyline points="11 11 14 8 11 5"/><line x1="14" y1="8" x2="6" y2="8"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Identity sidebar */}
      <div className="w-60 flex flex-col flex-shrink-0 overflow-y-auto" style={{ background: 'var(--nav)' }}>
        <div className="px-5 py-[21px_20px_17px]" style={{ borderBottom: '1px solid var(--rule)' }}>
          <div className="text-[9px] font-bold tracking-[4px] uppercase" style={{ color: 'var(--acc-text)' }}>Clausule</div>
        </div>
        <div className="px-5 py-5 flex-1 flex flex-col gap-[18px] overflow-y-auto">
          <div>
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold mb-2.5"
              style={{ background: 'var(--acc-tint)', color: 'var(--acc-text)' }}
            >
              JE
            </div>
            <div className="text-[20px] font-black tracking-[-0.3px] leading-tight" style={{ color: 'var(--tp)' }}>
              Jordan Ellis
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--tm)' }}>
              Senior engineer · Platform
            </div>
          </div>

          <div className="h-px" style={{ background: 'var(--rule)' }} />

          {/* Manager notes */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.6px] mb-2 font-bold" style={{ color: 'var(--tc)' }}>
              Manager notes
            </div>
            <div className="flex flex-col gap-3">
              {MANAGER_NOTES.map((n, i) => (
                <p
                  key={i}
                  className="text-[12px] font-normal italic leading-[1.75] pl-3 border-l-2"
                  style={{ color: 'var(--ts)', borderColor: 'var(--acc-text)' }}
                >
                  {n.text}
                </p>
              ))}
            </div>
          </div>

          <div className="h-px" style={{ background: 'var(--rule)' }} />

          {/* Performance ring (visual) */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.6px] mb-3 font-bold" style={{ color: 'var(--tc)' }}>
              Overview
            </div>
            <div className="flex items-center gap-2.5">
              <svg width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
                <circle cx="25" cy="25" r="20" fill="none" stroke="#D05A34" strokeWidth="4"
                  strokeDasharray="88 125" strokeDashoffset="31" strokeLinecap="round"/>
                <circle cx="25" cy="25" r="13" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
                <circle cx="25" cy="25" r="13" fill="none" stroke="#EF9F27" strokeWidth="3"
                  strokeDasharray="65 82" strokeDashoffset="20" strokeLinecap="round"/>
              </svg>
              <div>
                <div className="text-[13px] font-bold" style={{ color: 'var(--tp)' }}>Going well</div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--tm)' }}>
                  7 entries total
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 px-8 py-8" style={{ background: 'var(--canvas)' }}>
        {/* Tabs */}
        <div className="flex border-b mb-6 gap-0" style={{ borderColor: 'var(--rule)' }}>
          {['brag', 'cv'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-[18px] py-[11px] text-[13px] font-bold border-b-2 transition-all bg-transparent border-t-0 border-l-0 border-r-0 cursor-pointer"
              style={{
                borderColor: tab === t ? 'var(--acc)' : 'transparent',
                color: tab === t ? 'var(--acc-text)' : 'var(--tm)',
              }}
            >
              {t === 'brag' ? 'Brag doc' : 'CV / Resume'}
            </button>
          ))}
        </div>

        {/* Brag doc tab */}
        {tab === 'brag' && (
          <div>
            {/* Manager summary banner */}
            <div
              className="rounded-clausule2 p-[16px_18px] mb-5"
              style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
            >
              <div
                className="text-[9px] uppercase tracking-[0.6px] mb-2 flex items-center gap-2 font-bold"
                style={{ color: 'var(--tm)' }}
              >
                Manager summary
                <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                  style={{ background: 'var(--acc-tint)', color: 'var(--acc-text)' }}
                >
                  Read only
                </span>
              </div>
              <p
                className="text-[15px] font-normal italic leading-[1.85] pl-3.5 border-l-2"
                style={{ color: 'var(--ts)', borderColor: 'var(--acc-text)' }}
              >
                {MANAGER_SUMMARY}
              </p>
            </div>

            {/* Brag entries */}
            <div
              className="rounded-clausule2 p-[16px_18px]"
              style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
            >
              <div className="text-[9px] uppercase tracking-[0.6px] mb-4 font-bold" style={{ color: 'var(--tm)' }}>
                Your highlights
              </div>
              <div className="flex flex-col gap-3">
                {bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 group">
                    <span className="mt-1 flex-shrink-0 font-bold" style={{ color: 'var(--acc-text)' }}>·</span>
                    <input
                      value={b}
                      onChange={(e) => updateBullet(i, e.target.value)}
                      placeholder="Add a highlight…"
                      className="flex-1 text-[14px] bg-transparent border-0 outline-none"
                      style={{
                        color: 'var(--tp)',
                        fontFamily: 'var(--font-sans)',
                      }}
                    />
                    <button
                      onClick={() => removeBullet(i)}
                      className="opacity-0 group-hover:opacity-100 transition-all text-[11px]"
                      style={{ color: 'var(--tm)' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={addBullet}
                  className="flex items-center gap-1.5 text-[12px] font-bold transition-colors pl-4"
                  style={{ color: 'var(--tm)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--acc-text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--tm)'}
                >
                  <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/>
                  </svg>
                  Add highlight
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CV tab */}
        {tab === 'cv' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[13px]" style={{ color: 'var(--ts)' }}>Generate a CV from your brag doc and file notes.</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--tm)' }}>Edit any field directly after generating.</p>
              </div>
              <button
                onClick={generateCV}
                disabled={generating}
                className="flex items-center gap-1.5 px-[18px] py-2.5 text-[12px] font-bold text-white rounded-clausule hover:opacity-90 disabled:opacity-50 transition-opacity"
                style={{ background: 'var(--acc)' }}
              >
                {generating ? (
                  <>
                    <span className="inline-flex gap-1">
                      {[0,1,2].map(i => (
                        <span key={i} className="think-dot w-1 h-1 rounded-full bg-white"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </span>
                    Generating…
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 1v2M8 13v2M1 8h2M13 8h2"/><circle cx="8" cy="8" r="3"/>
                    </svg>
                    Generate with AI
                  </>
                )}
              </button>
            </div>

            {cvVisible && (
              <div
                className="rounded-clausule2 p-[36px_38px]"
                style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
              >
                <span
                  contentEditable suppressContentEditableWarning
                  className="block text-[32px] font-black tracking-[-0.8px] leading-[1.1] mb-1.5 outline-none rounded"
                  style={{ color: 'var(--tp)' }}
                >
                  Jordan Ellis
                </span>
                <span
                  contentEditable suppressContentEditableWarning
                  className="block text-[15px] font-normal italic mb-[18px] outline-none rounded"
                  style={{ color: 'var(--ts)' }}
                >
                  Senior Software Engineer · Platform Infrastructure
                </span>
                <span
                  contentEditable suppressContentEditableWarning
                  className="block text-[12px] mb-5 outline-none rounded"
                  style={{ color: 'var(--tm)' }}
                >
                  jordan.ellis@acmecorp.com · github.com/jordan-ellis
                </span>

                <div className="h-px mb-[18px]" style={{ background: 'var(--rule)' }} />

                <div className="text-[9px] uppercase tracking-[0.8px] mb-3.5 font-bold" style={{ color: 'var(--tm)' }}>Experience</div>

                <div className="mb-5">
                  <div className="flex items-baseline justify-between mb-1">
                    <span contentEditable suppressContentEditableWarning
                      className="text-[15px] font-bold outline-none rounded"
                      style={{ color: 'var(--tp)' }}>
                      Senior Software Engineer
                    </span>
                    <span className="text-[12px] ml-3 flex-shrink-0" style={{ color: 'var(--tm)' }}>2023–Present</span>
                  </div>
                  <span contentEditable suppressContentEditableWarning
                    className="block text-[13px] mb-2.5 outline-none rounded"
                    style={{ color: 'var(--ts)' }}>
                    Acme Corp · Platform team
                  </span>
                  <ul className="list-none p-0 m-0">
                    {bullets.map((b, i) => (
                      <li key={i} className="relative pl-4 py-1 text-[13px] leading-[1.75]" style={{ color: 'var(--ts)' }}>
                        <span className="absolute left-1 top-1 font-bold" style={{ color: 'var(--acc-text)' }}>·</span>
                        <span contentEditable suppressContentEditableWarning className="outline-none">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
