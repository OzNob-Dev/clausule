import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { storage } from '../utils/storage'
import { useTheme } from '../hooks/useTheme'
import '../styles/brag-employee.css'

const MANAGER_NOTE =
  'Jordan has had a strong year. The platform migration was the headline — delivered early with consistently positive stakeholder feedback. Genuine tech lead potential here.'

const INITIAL_ENTRIES = [
  {
    id: 1,
    title: 'Presented at guild session — observability tooling',
    date: '2025-11-06',
    body: 'Ran a 45-minute guild session on distributed tracing and observability. Positive attendance — follow-up led to two new team tooling adoptions.',
    strength: 'Exceptional',
    strengthHint: 'Strong across all evidence types',
    ringOffsets: [0, 0, 10],
    pills: [
      { label: 'Slide deck', type: 'filled' },
      { label: '2 adoptions', type: 'gold' },
      { label: 'Attendance data', type: 'gold' },
      { label: 'Peer shoutout', type: 'filled' },
    ],
  },
  {
    id: 2,
    title: 'Led architecture review for Q3 platform migration',
    date: '2025-12-18',
    body: 'Facilitated a cross-team architecture review covering the new event streaming layer. Produced the decision record, got sign-off from 4 teams. Migration ran on schedule with zero rollback events.',
    strength: 'Solid',
    strengthHint: 'Good artefact coverage — add metrics to reach Strong',
    ringOffsets: [0, 19, 37.7],
    pills: [
      { label: 'Decision record', type: 'filled' },
      { label: '4-team sign-off', type: 'filled' },
      { label: '+ add metrics', type: 'empty' },
      { label: '+ peer feedback', type: 'empty' },
    ],
  },
]

const EVIDENCE_TYPES = ['Work artefact', 'Metrics / data', 'Peer recognition', 'External link']

function formatRelativeDate(dateStr) {
  const then = new Date(dateStr)
  const now = new Date()
  const diffMs = now - then
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 1) return 'today'
  if (diffDays < 30) return `${diffDays}d ago`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths}mo ago`
  return `${Math.floor(diffMonths / 12)}y ago`
}

function EntryRings({ offsets }) {
  const [outerOff, midOff, innerOff] = offsets
  return (
    <div className="be-entry-rings" aria-hidden="true">
      <svg viewBox="0 0 44 44" width="44" height="44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(180,140,110,0.12)" strokeWidth="3.5"/>
        <circle cx="22" cy="22" r="18" fill="none" stroke="#C46B4A" strokeWidth="3.5"
          strokeDasharray="113.1" strokeDashoffset={outerOff} strokeLinecap="round"
          transform="rotate(-90 22 22)"/>
      </svg>
      <svg viewBox="0 0 44 44" width="44" height="44" className="be-entry-rings-overlay">
        <circle cx="22" cy="22" r="12" fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="3.5"/>
        <circle cx="22" cy="22" r="12" fill="none" stroke="#C9A84C" strokeWidth="3.5"
          strokeDasharray="75.4" strokeDashoffset={midOff} strokeLinecap="round"
          transform="rotate(-90 22 22)"/>
      </svg>
      <svg viewBox="0 0 44 44" width="44" height="44" className="be-entry-rings-overlay">
        <circle cx="22" cy="22" r="6" fill="none" stroke="rgba(180,140,110,0.1)" strokeWidth="3.5"/>
        <circle cx="22" cy="22" r="6" fill="none"
          stroke={innerOff >= 37.7 ? 'rgba(180,140,110,0.18)' : '#8C7B6E'}
          strokeWidth="3.5"
          strokeDasharray="37.7" strokeDashoffset={innerOff} strokeLinecap="round"
          transform="rotate(-90 22 22)"/>
      </svg>
    </div>
  )
}

export default function BragEmployee() {
  const { toggle } = useTheme()
  const navigate = useNavigate()
  const [tab, setTab] = useState('brag')
  const [entries, setEntries] = useState(INITIAL_ENTRIES)
  const [composerOpen, setComposerOpen] = useState(false)
  const [compTitle, setCompTitle] = useState('')
  const [compBody, setCompBody] = useState('')
  const [compEvTypes, setCompEvTypes] = useState(new Set())
  const [compCount, setCompCount] = useState(1)
  const [cvVisible, setCvVisible] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [cvBullets, setCvBullets] = useState([])
  const [cvAutosaved, setCvAutosaved] = useState(false)
  const [cvCopied, setCvCopied] = useState(false)
  const autosaveTimer = useRef(null)

  const logout = () => {
    storage.clearAuth()
    navigate('/')
  }

  const toggleEvType = (type) => {
    setCompEvTypes((prev) => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  const openComposer = () => {
    setCompTitle('')
    setCompBody('')
    setCompEvTypes(new Set())
    setCompCount(1)
    setComposerOpen(true)
  }

  const closeComposer = () => setComposerOpen(false)

  const saveEntry = () => {
    if (!compTitle.trim()) return
    const newEntry = {
      id: Date.now(),
      title: compTitle.trim(),
      date: new Date().toISOString().slice(0, 10),
      body: compBody.trim(),
      strength: compEvTypes.size >= 3 ? 'Exceptional' : compEvTypes.size >= 2 ? 'Solid' : 'Good',
      strengthHint: 'Evidence added',
      ringOffsets: [compEvTypes.size >= 1 ? 0 : 113.1, compEvTypes.size >= 2 ? 0 : 75.4, compEvTypes.size >= 3 ? 0 : 37.7],
      pills: [...compEvTypes].map((t) => ({ label: t, type: 'filled' })),
    }
    setEntries((prev) => [newEntry, ...prev])
    closeComposer()
  }

  const generateCV = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setCvBullets([
        'Led observability guild session for cross-functional engineering team — drove adoption across 2 teams and received peer recognition for knowledge sharing impact',
        'Facilitated platform migration architecture review; produced formal decision record and secured sign-off from 4 teams with zero rollback events on go-live',
        'Delivered Q3 platform migration ahead of schedule with measurable improvement to system reliability across dependent services',
      ])
      setCvVisible(true)
    }, 1400)
  }

  const scheduleAutosave = () => {
    clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      setCvAutosaved(true)
      setTimeout(() => setCvAutosaved(false), 2200)
    }, 1200)
  }

  const getCVText = () => {
    const name = document.getElementById('cv-name')?.textContent || 'Jordan Ellis'
    const tagline = document.getElementById('cv-tagline')?.textContent || ''
    const contact = document.getElementById('cv-contact')?.textContent || ''
    const jobTitle = document.getElementById('cv-job-title')?.textContent || ''
    const jobMeta = document.getElementById('cv-job-meta')?.textContent || ''
    const company = document.getElementById('cv-company')?.textContent || ''
    const bullets = [...(document.querySelectorAll('.be-cv-bullet-li') || [])].map((li) => '• ' + li.textContent).join('\n')
    return `${name}\n${tagline}\n${contact}\n\nEXPERIENCE\n${jobTitle} — ${company} · ${jobMeta}\n${bullets}`
  }

  const copyCV = () => {
    navigator.clipboard.writeText(getCVText()).catch(() => {})
    setCvCopied(true)
    setTimeout(() => setCvCopied(false), 2000)
  }

  const downloadCV = () => {
    const name = (document.getElementById('cv-name')?.textContent || 'resume').replace(/\s+/g, '-').toLowerCase()
    const blob = new Blob([getCVText()], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${name}-resume.txt`
    a.click()
  }

  return (
    <div className="flex w-full min-h-screen be-page">
      {/* Employee rail */}
      <aside
        className="w-[46px] flex flex-col items-center py-[18px] flex-shrink-0 sticky top-0 h-screen opacity-[0.55] hover:opacity-100 transition-opacity duration-200 be-sidebar"
        aria-label="App navigation"
      >
        <div className="text-[8px] font-bold tracking-[4px] uppercase mb-5 select-none be-rail-logo" aria-hidden="true">
          CLS
        </div>
        <nav className="flex-1 flex flex-col items-center gap-1" aria-label="Primary">
          <button
            className="w-[34px] h-[34px] flex items-center justify-center rounded-clausule be-rail-btn-active"
            aria-label="Brag doc" aria-current="page"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M8 2l1 2.5L11.5 5l-2 2 .5 3L8 8.5 5.5 10l.5-3-2-2L6.5 4.5z"/>
              <circle cx="13" cy="12" r="1.5"/>
            </svg>
          </button>
        </nav>
        <div className="flex flex-col items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold be-rail-avatar" aria-hidden="true">
            JE
          </div>
          <button
            onClick={logout}
            className="w-7 h-7 flex items-center justify-center transition-opacity opacity-40 hover:opacity-100 bg-transparent border-0 be-rail-icon-btn"
            aria-label="Sign out"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3"/>
              <polyline points="11 11 14 8 11 5"/><line x1="14" y1="8" x2="6" y2="8"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Identity sidebar */}
      <div className="w-60 flex flex-col flex-shrink-0 overflow-y-auto be-sidebar" role="complementary" aria-label="Profile and evidence">
        <div className="px-5 py-[21px_20px_17px] be-sidebar-header">
          <div className="text-[9px] font-bold tracking-[4px] uppercase be-sidebar-eyebrow">Clausule · Brag doc</div>
        </div>
        <div className="px-5 py-5 flex-1 flex flex-col gap-[18px] overflow-y-auto">
          <div>
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold mb-2.5 be-sidebar-avatar" aria-hidden="true">
              JE
            </div>
            <div className="text-[20px] font-black tracking-[-0.3px] leading-tight be-sidebar-name">
              Jordan Ellis
            </div>
            <div className="text-[11px] mt-0.5 be-sidebar-role">
              Senior engineer · Platform
            </div>
          </div>

          <div className="h-px be-divider" role="separator" />

          {/* Manager note */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.6px] mb-2 font-bold be-notes-label">
              Manager note
            </div>
            <p className="text-[12px] font-normal italic leading-[1.75] pl-3 border-l-2 be-note-quote">
              {MANAGER_NOTE}
            </p>
          </div>

          <div className="h-px be-divider" role="separator" />

          {/* Evidence strength */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.6px] mb-3 font-bold be-overview-label">
              Evidence strength
            </div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="be-sidebar-rings" aria-hidden="true">
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4"/>
                  <circle cx="25" cy="25" r="20" fill="none" stroke="#C46B4A" strokeWidth="4"
                    strokeDasharray="125.7" strokeDashoffset="31" strokeLinecap="round"
                    transform="rotate(-90 25 25)"/>
                </svg>
                <svg width="50" height="50" viewBox="0 0 50 50" className="be-sidebar-rings-overlay">
                  <circle cx="25" cy="25" r="13" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"/>
                  <circle cx="25" cy="25" r="13" fill="none" stroke="#C9A84C" strokeWidth="4"
                    strokeDasharray="81.7" strokeDashoffset="20" strokeLinecap="round"
                    transform="rotate(-90 25 25)"/>
                </svg>
                <svg width="50" height="50" viewBox="0 0 50 50" className="be-sidebar-rings-overlay">
                  <circle cx="25" cy="25" r="6" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4"/>
                  <circle cx="25" cy="25" r="6" fill="none" stroke="#8C7B6E" strokeWidth="4"
                    strokeDasharray="37.7" strokeDashoffset="9" strokeLinecap="round"
                    transform="rotate(-90 25 25)"/>
                </svg>
              </div>
              <div>
                <div className="text-[13px] font-bold be-overview-status">Strong</div>
                <div className="text-[11px] mt-0.5 be-overview-sub">3 of 4 types</div>
              </div>
            </div>
            <ul className="be-ring-legend" aria-label="Evidence type breakdown">
              <li className="be-ring-leg">
                <span className="be-ring-leg-dot" style={{ background: '#C46B4A' }} aria-hidden="true" />
                Work artefacts ✓
              </li>
              <li className="be-ring-leg">
                <span className="be-ring-leg-dot" style={{ background: '#C9A84C' }} aria-hidden="true" />
                Metrics / data ✓
              </li>
              <li className="be-ring-leg">
                <span className="be-ring-leg-dot" style={{ background: '#8C7B6E' }} aria-hidden="true" />
                Peer recognition ✓
              </li>
              <li className="be-ring-leg be-ring-leg--missing">
                <span className="be-ring-leg-dot be-ring-leg-dot--missing" aria-hidden="true" />
                External links — add one for Exceptional
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto be-main">
        <div className="be-inner">

          {/* Tabs */}
          <div className="flex border-b mb-6 gap-0 be-tabs" role="tablist">
            {[['brag', 'Brag doc'], ['cv', 'Resume']].map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                aria-controls={`panel-${key}`}
                onClick={() => setTab(key)}
                className={`px-[18px] py-[11px] text-[13px] font-bold border-b-2 transition-all bg-transparent border-t-0 border-l-0 border-r-0 cursor-pointer be-tab${tab === key ? ' be-tab--active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Brag doc tab */}
          <div id="panel-brag" role="tabpanel" aria-labelledby="tab-brag" hidden={tab !== 'brag'}>

            {/* Manager banner */}
            <div className="rounded-clausule2 p-[16px_18px] mb-5 be-card">
              <div className="text-[9px] uppercase tracking-[0.6px] mb-2 flex items-center gap-2 font-bold be-card-label">
                From your manager
                <div className="flex-1 h-px be-card-rule" aria-hidden="true" />
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold be-read-only-badge">
                  Read only
                </span>
              </div>
              <p className="text-[15px] font-normal italic leading-[1.85] pl-3.5 border-l-2 be-summary-quote">
                {MANAGER_NOTE}
              </p>
            </div>

            {/* Entry list */}
            <div className="text-[9px] uppercase tracking-[0.6px] mb-3 font-bold be-sec-label">
              Your entries
            </div>

            {entries.map((entry) => (
              <article key={entry.id} className="rounded-clausule2 mb-3 be-entry-card">
                <div className="be-entry-head">
                  <div className="be-entry-title">{entry.title}</div>
                  <div className="be-entry-date">
                    <time dateTime={entry.date}>{formatRelativeDate(entry.date)}</time>
                  </div>
                </div>
                <p className="be-entry-body">{entry.body}</p>
                <div className="be-evidence-row">
                  <EntryRings offsets={entry.ringOffsets} />
                  <div>
                    <div className="be-strength-word" style={{ color: '#C46B4A' }}>{entry.strength}</div>
                    <div className="be-strength-hint">{entry.strengthHint}</div>
                    <div className="be-ev-pills" role="list" aria-label="Evidence">
                      {entry.pills.map((pill, i) => (
                        <span key={i} role="listitem" className={`be-ev-pill be-ev-pill--${pill.type}`}>
                          <span
                            className="be-ev-pill-dot"
                            style={pill.type === 'gold' ? { background: '#C9A84C' } : pill.type === 'empty' ? { background: '#C4C0BA' } : undefined}
                            aria-hidden="true"
                          />
                          {pill.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {/* Add a win */}
            {!composerOpen ? (
              <button onClick={openComposer} className="be-add-trigger">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <line x1="8" y1="3" x2="8" y2="13"/>
                  <line x1="3" y1="8" x2="13" y2="8"/>
                </svg>
                Add a win
              </button>
            ) : (
              <div className="be-composer" role="form" aria-label="Add a new entry">
                <input
                  type="text"
                  className="be-comp-title"
                  placeholder="What did you achieve?"
                  value={compTitle}
                  onChange={(e) => setCompTitle(e.target.value)}
                  autoFocus
                />
                <textarea
                  className="be-comp-body"
                  rows={4}
                  placeholder="Describe what you did, what the impact was, and how you know it worked."
                  value={compBody}
                  onChange={(e) => setCompBody(e.target.value)}
                />
                <div className="be-comp-ev-label">Evidence types — tick all that apply</div>
                <div className="be-comp-ev-types" role="group" aria-label="Evidence types">
                  {EVIDENCE_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleEvType(type)}
                      aria-pressed={compEvTypes.has(type)}
                      className={`be-comp-ev-type${compEvTypes.has(type) ? ' be-comp-ev-type--sel' : ''}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="be-comp-count-label">How many pieces of evidence?</div>
                <div className="flex items-center gap-3 mb-[14px]">
                  <input
                    type="number"
                    className="be-comp-count-input"
                    min={1}
                    max={20}
                    value={compCount}
                    onChange={(e) => setCompCount(Number(e.target.value))}
                    aria-label="Number of evidence pieces"
                  />
                  <span className="text-[11px] be-comp-count-hint">More sources of the same type strengthens your case</span>
                </div>
                <div className="be-comp-footer">
                  <div />
                  <div className="flex gap-2">
                    <button type="button" onClick={closeComposer} className="be-comp-cancel">Cancel</button>
                    <button type="button" onClick={saveEntry} className="be-comp-save">Save entry</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CV / Resume tab */}
          <div id="panel-cv" role="tabpanel" aria-labelledby="tab-cv" hidden={tab !== 'cv'}>

            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[13px] be-cv-desc">Generate your resume from your brag doc entries.</p>
                <p className="text-[11px] mt-0.5 be-cv-subdesc">Everything is editable — treat it as a living document you take with you.</p>
              </div>
              <button
                onClick={generateCV}
                disabled={generating}
                className="flex items-center gap-1.5 px-[18px] py-2.5 text-[12px] font-bold text-white rounded-clausule hover:opacity-90 disabled:opacity-50 transition-opacity be-btn-generate"
              >
                {generating ? (
                  <>
                    <span className="inline-flex gap-1" aria-hidden="true">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="think-dot w-1 h-1 rounded-full bg-white" />
                      ))}
                    </span>
                    <span>Generating…</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M8 2l1 2.5L11.5 5l-2 2 .5 3L8 8.5 5.5 10l.5-3-2-2L6.5 4.5z"/>
                    </svg>
                    {cvVisible ? 'Regenerate' : 'Generate resume'}
                  </>
                )}
              </button>
            </div>

            {cvVisible && (
              <>
                <div className="rounded-clausule2 p-[36px_38px] mb-4 be-cv-card">
                  {/* Autosave indicator */}
                  <div className={`be-cv-autosave${cvAutosaved ? ' be-cv-autosave--show' : ''}`} aria-live="polite" aria-atomic="true">
                    <svg className="w-[11px] h-[11px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <polyline points="3 8 6 11 13 4"/>
                    </svg>
                    Autosaved
                  </div>

                  <span
                    id="cv-name"
                    contentEditable suppressContentEditableWarning
                    onInput={scheduleAutosave}
                    className="block text-[32px] font-black tracking-[-0.8px] leading-[1.1] mb-1.5 outline-none rounded be-cv-name"
                    role="textbox" aria-label="Full name" aria-multiline="false"
                  >
                    Jordan Ellis
                  </span>
                  <span
                    id="cv-tagline"
                    contentEditable suppressContentEditableWarning
                    onInput={scheduleAutosave}
                    className="block text-[15px] font-normal italic mb-[18px] outline-none rounded be-cv-tagline"
                    role="textbox" aria-label="Professional tagline" aria-multiline="false"
                  >
                    Senior software engineer — platform infrastructure, distributed systems, technical leadership
                  </span>
                  <span
                    id="cv-contact"
                    contentEditable suppressContentEditableWarning
                    onInput={scheduleAutosave}
                    className="block text-[12px] mb-5 outline-none rounded be-cv-contact"
                    role="textbox" aria-label="Contact info" aria-multiline="false"
                  >
                    jordan.ellis@acmecorp.com · Platform team · Acme Corp
                  </span>

                  <div className="h-px mb-[18px] be-cv-rule" aria-hidden="true" />

                  <div className="text-[9px] uppercase tracking-[0.8px] mb-3.5 font-bold be-cv-section-label">Experience</div>

                  <div className="mb-5">
                    <div className="flex items-baseline justify-between mb-1">
                      <span
                        id="cv-job-title"
                        contentEditable suppressContentEditableWarning
                        onInput={scheduleAutosave}
                        className="text-[15px] font-bold outline-none rounded be-cv-job-title"
                        role="textbox" aria-label="Job title" aria-multiline="false"
                      >
                        Senior engineer
                      </span>
                      <span
                        id="cv-job-meta"
                        contentEditable suppressContentEditableWarning
                        onInput={scheduleAutosave}
                        className="text-[12px] ml-3 flex-shrink-0 outline-none rounded be-cv-dates"
                        role="textbox" aria-label="Employment dates" aria-multiline="false"
                      >
                        Acme Corp · Mar 2022–present
                      </span>
                    </div>
                    <span
                      id="cv-company"
                      contentEditable suppressContentEditableWarning
                      onInput={scheduleAutosave}
                      className="block text-[13px] mb-2.5 outline-none rounded be-cv-company"
                      role="textbox" aria-label="Company" aria-multiline="false"
                    >
                      Platform team
                    </span>
                    <ul className="list-none p-0 m-0" aria-label="Accomplishments">
                      {cvBullets.map((b, i) => (
                        <li
                          key={i}
                          contentEditable suppressContentEditableWarning
                          onInput={scheduleAutosave}
                          className="be-cv-bullet be-cv-bullet-li relative pl-4 py-1 text-[13px] leading-[1.75] outline-none"
                        >
                          <span className="absolute left-1 top-1 font-bold be-cv-bullet-marker" aria-hidden="true">·</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="h-px mb-[18px] be-cv-rule" aria-hidden="true" />

                  <div className="text-[9px] uppercase tracking-[0.8px] mb-3.5 font-bold be-cv-section-label">Education</div>

                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <span
                        contentEditable suppressContentEditableWarning
                        onInput={scheduleAutosave}
                        className="text-[15px] font-bold outline-none rounded be-cv-job-title"
                        role="textbox" aria-label="Degree" aria-multiline="false"
                      >
                        Bachelor of Computer Science
                      </span>
                      <span
                        contentEditable suppressContentEditableWarning
                        onInput={scheduleAutosave}
                        className="text-[12px] ml-3 flex-shrink-0 outline-none rounded be-cv-dates"
                        role="textbox" aria-label="Study dates" aria-multiline="false"
                      >
                        2018–2022
                      </span>
                    </div>
                    <span
                      contentEditable suppressContentEditableWarning
                      onInput={scheduleAutosave}
                      className="block text-[13px] outline-none rounded be-cv-company"
                      role="textbox" aria-label="Institution" aria-multiline="false"
                    >
                      University of Technology · Click to edit
                    </span>
                  </div>
                </div>

                {/* CV actions */}
                <div className="be-cv-actions">
                  <button onClick={copyCV} className="be-cv-copy-btn">
                    <svg className="w-[13px] h-[13px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <rect x="5" y="5" width="9" height="9" rx="1"/>
                      <path d="M3 11V3a1 1 0 0 1 1-1h8"/>
                    </svg>
                    Copy text
                  </button>
                  <button onClick={downloadCV} className="be-cv-dl-btn">
                    <svg className="w-[13px] h-[13px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M8 2v8M5 7l3 3 3-3"/>
                      <line x1="2" y1="13" x2="14" y2="13"/>
                    </svg>
                    Download .txt
                  </button>
                  <span
                    className={`be-cv-copied${cvCopied ? ' be-cv-copied--show' : ''}`}
                    aria-live="polite"
                  >
                    Copied
                  </span>
                </div>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
