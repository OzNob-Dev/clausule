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
        <circle cx="22" cy="22" r="18" fill="none" strokeWidth="3.5"
          style={{ stroke: 'var(--ring-outer)' }}
          strokeDasharray="113.1" strokeDashoffset={outerOff} strokeLinecap="round"
          transform="rotate(-90 22 22)"/>
      </svg>
      <svg viewBox="0 0 44 44" width="44" height="44" className="be-entry-rings-overlay">
        <circle cx="22" cy="22" r="12" fill="none" stroke="rgba(180,140,110,0.1)" strokeWidth="3.5"/>
        <circle cx="22" cy="22" r="12" fill="none" strokeWidth="3.5"
          style={{ stroke: 'var(--ring-mid)' }}
          strokeDasharray="75.4" strokeDashoffset={midOff} strokeLinecap="round"
          transform="rotate(-90 22 22)"/>
      </svg>
      <svg viewBox="0 0 44 44" width="44" height="44" className="be-entry-rings-overlay">
        <circle cx="22" cy="22" r="6" fill="none" stroke="rgba(180,140,110,0.1)" strokeWidth="3.5"/>
        <circle cx="22" cy="22" r="6" fill="none" strokeWidth="3.5"
          style={{ stroke: innerOff >= 37.7 ? 'rgba(180,140,110,0.18)' : 'var(--ring-inner)' }}
          strokeDasharray="37.7" strokeDashoffset={innerOff} strokeLinecap="round"
          transform="rotate(-90 22 22)"/>
      </svg>
    </div>
  )
}

export default function BragEmployee() {
  useTheme()
  const navigate = useNavigate()
  const [tab, setTab] = useState('brag')
  const [entries, setEntries] = useState(INITIAL_ENTRIES)
  const [composerOpen, setComposerOpen] = useState(false)
  const [compTitle, setCompTitle] = useState('')
  const [compBody, setCompBody] = useState('')
  const [compEvTypes, setCompEvTypes] = useState(new Set())
  const [compFiles, setCompFiles] = useState([])
  const [dropActive, setDropActive] = useState(false)
  const fileInputRef = useRef(null)
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

  const addFiles = (files) => {
    const mapped = [...files].map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: f.size,
      type: f.type,
    }))
    setCompFiles((prev) => [...prev, ...mapped])
  }

  const removeFile = (id) => setCompFiles((prev) => prev.filter((f) => f.id !== id))

  const handleDrop = (e) => {
    e.preventDefault()
    setDropActive(false)
    addFiles(e.dataTransfer.files)
  }

  const openComposer = () => {
    setCompTitle('')
    setCompBody('')
    setCompEvTypes(new Set())
    setCompFiles([])
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
      strengthHint: compFiles.length
        ? `${compFiles.length} file${compFiles.length !== 1 ? 's' : ''} attached`
        : 'Evidence added',
      ringOffsets: [compEvTypes.size >= 1 ? 0 : 113.1, compEvTypes.size >= 2 ? 0 : 75.4, compEvTypes.size >= 3 ? 0 : 37.7],
      pills: compFiles.slice(0, 4).map((f) => ({ label: f.name.replace(/\.[^.]+$/, ''), type: 'filled' })),
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
    <div className="be-page">
      {/* Employee rail */}
      <aside className="be-rail be-sidebar" aria-label="App navigation">
        <div className="be-rail-logo" aria-hidden="true">CLS</div>
        <nav className="be-rail-nav" aria-label="Primary">
          <button
            className="be-rail-btn-active"
            aria-label="Brag doc" aria-current="page"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M8 2l1 2.5L11.5 5l-2 2 .5 3L8 8.5 5.5 10l.5-3-2-2L6.5 4.5z"/>
              <circle cx="13" cy="12" r="1.5"/>
            </svg>
          </button>
        </nav>
        <div className="be-rail-foot">
          <div className="be-rail-avatar" aria-hidden="true">JE</div>
          <button
            onClick={logout}
            className="be-rail-icon-btn"
            aria-label="Sign out"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3"/>
              <polyline points="11 11 14 8 11 5"/><line x1="14" y1="8" x2="6" y2="8"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Identity sidebar */}
      <div className="be-identity be-sidebar" role="complementary" aria-label="Profile and evidence">
        <div className="be-sidebar-header">
          <div className="be-sidebar-eyebrow">Clausule · Brag doc</div>
        </div>
        <div className="be-sidebar-body">
          <div>
            <div className="be-sidebar-avatar" aria-hidden="true">JE</div>
            <div className="be-sidebar-name">Jordan Ellis</div>
            <div className="be-sidebar-role">Senior engineer · Platform</div>
          </div>

          <div className="be-divider" role="separator" />

          {/* Manager note */}
          <div>
            <div className="be-notes-label">Manager note</div>
            <p className="be-note-quote">{MANAGER_NOTE}</p>
          </div>

          <div className="be-divider" role="separator" />

          {/* Evidence strength */}
          <div>
            <div className="be-overview-label">Evidence strength</div>
            <div className="be-strength-row">
              <div className="be-sidebar-rings" aria-hidden="true">
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4"/>
                  <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"
                    style={{ stroke: 'var(--ring-outer)' }}
                    strokeDasharray="125.7" strokeDashoffset="31" strokeLinecap="round"
                    transform="rotate(-90 25 25)"/>
                </svg>
                <svg width="50" height="50" viewBox="0 0 50 50" className="be-sidebar-rings-overlay">
                  <circle cx="25" cy="25" r="13" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"/>
                  <circle cx="25" cy="25" r="13" fill="none" strokeWidth="4"
                    style={{ stroke: 'var(--ring-mid)' }}
                    strokeDasharray="81.7" strokeDashoffset="20" strokeLinecap="round"
                    transform="rotate(-90 25 25)"/>
                </svg>
                <svg width="50" height="50" viewBox="0 0 50 50" className="be-sidebar-rings-overlay">
                  <circle cx="25" cy="25" r="6" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4"/>
                  <circle cx="25" cy="25" r="6" fill="none" strokeWidth="4"
                    style={{ stroke: 'var(--ring-inner)' }}
                    strokeDasharray="37.7" strokeDashoffset="9" strokeLinecap="round"
                    transform="rotate(-90 25 25)"/>
                </svg>
              </div>
              <div>
                <div className="be-overview-status">Strong</div>
                <div className="be-overview-sub">3 of 4 types</div>
              </div>
            </div>
            <ul className="be-ring-legend" aria-label="Evidence type breakdown">
              <li className="be-ring-leg">
                <span className="be-ring-leg-dot" style={{ background: 'var(--ring-outer)' }} aria-hidden="true" />
                Work artefacts ✓
              </li>
              <li className="be-ring-leg">
                <span className="be-ring-leg-dot" style={{ background: 'var(--ring-mid)' }} aria-hidden="true" />
                Metrics / data ✓
              </li>
              <li className="be-ring-leg">
                <span className="be-ring-leg-dot" style={{ background: 'var(--ring-inner)' }} aria-hidden="true" />
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
      <main className="be-main">
        <div className="be-inner">

          {/* Tabs */}
          <div className="be-tabs" role="tablist">
            {[['brag', 'Brag doc'], ['cv', 'Resume']].map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                aria-controls={`panel-${key}`}
                onClick={() => setTab(key)}
                className={`be-tab${tab === key ? ' be-tab--active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Brag doc tab */}
          <div id="panel-brag" role="tabpanel" aria-labelledby="tab-brag" hidden={tab !== 'brag'}>

            {/* Manager banner */}
            <div className="be-card">
              <div className="be-card-label">
                From your manager
                <div className="be-card-rule" aria-hidden="true" />
                <span className="be-read-only-badge">Read only</span>
              </div>
              <p className="be-summary-quote">{MANAGER_NOTE}</p>
            </div>

            {/* Entry list */}
            <div className="be-sec-label">Your entries</div>

            {entries.map((entry) => (
              <article key={entry.id} className="be-entry-card">
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
                    <div className="be-strength-word">{entry.strength}</div>
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
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
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
                <div className="be-comp-count-label">Evidence files</div>
                <div
                  className={`be-dropzone${dropActive ? ' be-dropzone--active' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDropActive(true) }}
                  onDragLeave={() => setDropActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  aria-label="Drop evidence files here or press Enter to browse"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
                    style={{ display: 'none' }}
                    aria-hidden="true"
                  />
                  <svg className="be-dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span className="be-dropzone-text">Drop files here or click to browse</span>
                  <span className="be-dropzone-sub">Screenshots, videos, PDFs, documents</span>
                </div>

                {compFiles.length > 0 && (
                  <ul className="be-file-list" aria-label="Attached files">
                    {compFiles.map((file) => (
                      <li key={file.id} className="be-file-item">
                        <svg className="be-file-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                          {file.type.startsWith('image/') ? (
                            <><rect x="1" y="1" width="14" height="14" rx="2"/><circle cx="5.5" cy="5.5" r="1.5"/><polyline points="1 11 5 7 8 10 11 7 15 11"/></>
                          ) : file.type.startsWith('video/') ? (
                            <><rect x="1" y="3" width="14" height="10" rx="1.5"/><polyline points="6 7 10 9.5 6 12"/></>
                          ) : (
                            <><path d="M9 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6z"/><polyline points="9 1 9 6 14 6"/></>
                          )}
                        </svg>
                        <span className="be-file-name">{file.name}</span>
                        <span className="be-file-size">{file.size < 1024 * 1024 ? `${Math.round(file.size / 1024)}KB` : `${(file.size / (1024 * 1024)).toFixed(1)}MB`}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="be-file-remove"
                          aria-label={`Remove ${file.name}`}
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/>
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="be-comp-footer">
                  <div />
                  <div className="be-comp-btns">
                    <button type="button" onClick={closeComposer} className="be-comp-cancel">Cancel</button>
                    <button type="button" onClick={saveEntry} className="be-comp-save">Save entry</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CV / Resume tab */}
          <div id="panel-cv" role="tabpanel" aria-labelledby="tab-cv" hidden={tab !== 'cv'}>

            <div className="be-cv-header">
              <div>
                <p className="be-cv-desc">Generate your resume from your brag doc entries.</p>
                <p className="be-cv-subdesc">Everything is editable — treat it as a living document you take with you.</p>
              </div>
              <button
                onClick={generateCV}
                disabled={generating}
                className="be-btn-generate"
              >
                {generating ? (
                  <>
                    <span className="be-thinking-dots" aria-hidden="true">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="think-dot" />
                      ))}
                    </span>
                    <span>Generating…</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M8 2l1 2.5L11.5 5l-2 2 .5 3L8 8.5 5.5 10l.5-3-2-2L6.5 4.5z"/>
                    </svg>
                    {cvVisible ? 'Regenerate' : 'Generate resume'}
                  </>
                )}
              </button>
            </div>

            {cvVisible && (
              <>
                <div className="be-cv-card">
                  {/* Autosave indicator */}
                  <div className={`be-cv-autosave${cvAutosaved ? ' be-cv-autosave--show' : ''}`} aria-live="polite" aria-atomic="true">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <polyline points="3 8 6 11 13 4"/>
                    </svg>
                    Autosaved
                  </div>

                  <span
                    id="cv-name"
                    contentEditable suppressContentEditableWarning
                    onInput={scheduleAutosave}
                    className="be-cv-name"
                    role="textbox" aria-label="Full name" aria-multiline="false"
                  >
                    Jordan Ellis
                  </span>
                  <span
                    id="cv-tagline"
                    contentEditable suppressContentEditableWarning
                    onInput={scheduleAutosave}
                    className="be-cv-tagline"
                    role="textbox" aria-label="Professional tagline" aria-multiline="false"
                  >
                    Senior software engineer — platform infrastructure, distributed systems, technical leadership
                  </span>
                  <span
                    id="cv-contact"
                    contentEditable suppressContentEditableWarning
                    onInput={scheduleAutosave}
                    className="be-cv-contact"
                    role="textbox" aria-label="Contact info" aria-multiline="false"
                  >
                    jordan.ellis@acmecorp.com · Platform team · Acme Corp
                  </span>

                  <div className="be-cv-rule" aria-hidden="true" />

                  <div className="be-cv-section-label">Experience</div>

                  <div className="be-cv-job">
                    <div className="be-cv-job-header">
                      <span
                        id="cv-job-title"
                        contentEditable suppressContentEditableWarning
                        onInput={scheduleAutosave}
                        className="be-cv-job-title"
                        role="textbox" aria-label="Job title" aria-multiline="false"
                      >
                        Senior engineer
                      </span>
                      <span
                        id="cv-job-meta"
                        contentEditable suppressContentEditableWarning
                        onInput={scheduleAutosave}
                        className="be-cv-dates"
                        role="textbox" aria-label="Employment dates" aria-multiline="false"
                      >
                        Acme Corp · Mar 2022–present
                      </span>
                    </div>
                    <span
                      id="cv-company"
                      contentEditable suppressContentEditableWarning
                      onInput={scheduleAutosave}
                      className="be-cv-company"
                      role="textbox" aria-label="Company" aria-multiline="false"
                    >
                      Platform team
                    </span>
                    <ul className="be-cv-bullets" aria-label="Accomplishments">
                      {cvBullets.map((b, i) => (
                        <li
                          key={i}
                          contentEditable suppressContentEditableWarning
                          onInput={scheduleAutosave}
                          className="be-cv-bullet be-cv-bullet-li"
                        >
                          <span className="be-cv-bullet-marker" aria-hidden="true">·</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="be-cv-rule" aria-hidden="true" />

                  <div className="be-cv-section-label">Education</div>

                  <>
                    <div className="be-cv-job-header">
                      <span
                        contentEditable suppressContentEditableWarning
                        onInput={scheduleAutosave}
                        className="be-cv-job-title"
                        role="textbox" aria-label="Degree" aria-multiline="false"
                      >
                        Bachelor of Computer Science
                      </span>
                      <span
                        contentEditable suppressContentEditableWarning
                        onInput={scheduleAutosave}
                        className="be-cv-dates"
                        role="textbox" aria-label="Study dates" aria-multiline="false"
                      >
                        2018–2022
                      </span>
                    </div>
                    <span
                      contentEditable suppressContentEditableWarning
                      onInput={scheduleAutosave}
                      className="be-cv-company"
                      role="textbox" aria-label="Institution" aria-multiline="false"
                    >
                      University of Technology · Click to edit
                    </span>
                  </>
                </div>

                {/* CV actions */}
                <div className="be-cv-actions">
                  <button onClick={copyCV} className="be-cv-copy-btn">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <rect x="5" y="5" width="9" height="9" rx="1"/>
                      <path d="M3 11V3a1 1 0 0 1 1-1h8"/>
                    </svg>
                    Copy text
                  </button>
                  <button onClick={downloadCV} className="be-cv-dl-btn">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
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
