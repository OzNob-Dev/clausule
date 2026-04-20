'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import ResumeDocument from './ResumeDocument'

const GENERATED_BULLETS = [
  'Led observability guild session for cross-functional engineering team — drove adoption across 2 teams and received peer recognition for knowledge sharing impact',
  'Facilitated platform migration architecture review; produced formal decision record and secured sign-off from 4 teams with zero rollback events on go-live',
  'Delivered Q3 platform migration ahead of schedule with measurable improvement to system reliability across dependent services',
]

const INITIAL_CV = {
  name: 'Jordan Ellis',
  tagline: 'Senior software engineer — platform infrastructure, distributed systems, technical leadership',
  contact: 'jordan.ellis@acmecorp.com · Platform team · Acme Corp',
  jobTitle: 'Senior engineer',
  jobMeta: 'Acme Corp · Mar 2022–present',
  company: 'Platform team',
  education: 'Bachelor of Computer Science',
  educationDates: '2018–2022',
  institution: 'University of Technology · Click to edit',
  bullets: GENERATED_BULLETS,
}

function GenerateButton({ disabled, generating, visible, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled || generating} className="be-btn-generate">
      {generating ? (
        <>
          <span className="be-thinking-dots" aria-hidden="true">
            {[0, 1, 2].map((i) => <span key={i} className="think-dot" />)}
          </span>
          <span>Generating…</span>
        </>
      ) : (
        <>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M8 2l1 2.5L11.5 5l-2 2 .5 3L8 8.5 5.5 10l.5-3-2-2L6.5 4.5z"/>
          </svg>
          {visible ? 'Regenerate' : 'Generate resume'}
        </>
      )}
    </button>
  )
}

function ResumeActions({ copied, onCopy, onDownload }) {
  return (
    <div className="be-cv-actions">
      <button onClick={onCopy} className="be-cv-copy-btn">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="5" y="5" width="9" height="9" rx="1"/>
          <path d="M3 11V3a1 1 0 0 1 1-1h8"/>
        </svg>
        Copy text
      </button>
      <button onClick={onDownload} className="be-cv-dl-btn">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M8 2v8M5 7l3 3 3-3"/>
          <line x1="2" y1="13" x2="14" y2="13"/>
        </svg>
        Download .txt
      </button>
      <span className={`be-cv-copied${copied ? ' be-cv-copied--show' : ''}`} aria-live="polite">Copied</span>
    </div>
  )
}

export default function ResumeTab({ disabled = false }) {
  const [cvVisible, setCvVisible] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [cvData, setCvData] = useState(INITIAL_CV)
  const [cvAutosaved, setCvAutosaved] = useState(false)
  const [cvCopied, setCvCopied] = useState(false)

  const generateTimerRef = useRef(null)
  const autosaveTimerRef = useRef(null)
  const autosaveHideTimerRef = useRef(null)
  const copyTimerRef = useRef(null)

  useEffect(() => () => {
    if (generateTimerRef.current) clearTimeout(generateTimerRef.current)
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    if (autosaveHideTimerRef.current) clearTimeout(autosaveHideTimerRef.current)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
  }, [])

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    if (autosaveHideTimerRef.current) clearTimeout(autosaveHideTimerRef.current)

    autosaveTimerRef.current = setTimeout(() => {
      setCvAutosaved(true)
      autosaveHideTimerRef.current = setTimeout(() => setCvAutosaved(false), 2200)
    }, 1200)
  }, [])

  const handleFieldInput = useCallback((field) => (event) => {
    const nextValue = event.currentTarget.textContent ?? ''
    setCvData((prev) => (prev[field] === nextValue ? prev : { ...prev, [field]: nextValue }))
    scheduleAutosave()
  }, [scheduleAutosave])

  const handleBulletInput = useCallback((index) => (event) => {
    const nextValue = event.currentTarget.textContent ?? ''
    setCvData((prev) => ({
      ...prev,
      bullets: prev.bullets.map((bullet, bulletIndex) => (bulletIndex === index ? nextValue : bullet)),
    }))
    scheduleAutosave()
  }, [scheduleAutosave])

  const generateCV = () => {
    if (disabled) return
    setGenerating(true)
    if (generateTimerRef.current) clearTimeout(generateTimerRef.current)

    generateTimerRef.current = setTimeout(() => {
      setGenerating(false)
      setCvData((prev) => ({ ...prev, bullets: GENERATED_BULLETS }))
      setCvVisible(true)
    }, 1400)
  }

  const getCVText = () => [
    cvData.name,
    cvData.tagline,
    cvData.contact,
    '',
    'EXPERIENCE',
    `${cvData.jobTitle} — ${cvData.company} · ${cvData.jobMeta}`,
    ...cvData.bullets.map((bullet) => `• ${bullet}`),
    '',
    'EDUCATION',
    `${cvData.education} · ${cvData.educationDates}`,
    cvData.institution,
  ].join('\n')

  const copyCV = () => {
    navigator.clipboard.writeText(getCVText()).catch(() => {})
    setCvCopied(true)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCvCopied(false), 2000)
  }

  const downloadCV = () => {
    const filename = (cvData.name || 'resume').replace(/\s+/g, '-').toLowerCase()
    const blob = new Blob([getCVText()], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${filename}-resume.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="be-cv-header">
        <div>
          <p className="be-cv-desc">Generate your resume from your brag doc entries.</p>
          <p className="be-cv-subdesc">Everything is editable — treat it as a living document you take with you.</p>
        </div>
        <GenerateButton disabled={disabled} generating={generating} visible={cvVisible} onClick={generateCV} />
      </div>

      {disabled && (
        <>
          <p className="be-cv-disabled-note">Add a brag entry to unlock resume generation.</p>
          <ResumeDocument cvData={cvData} autosaved={false} disabled onBulletInput={handleBulletInput} onFieldInput={handleFieldInput} />
        </>
      )}

      {!disabled && cvVisible && (
        <>
          <ResumeDocument cvData={cvData} autosaved={cvAutosaved} onBulletInput={handleBulletInput} onFieldInput={handleFieldInput} />
          <ResumeActions copied={cvCopied} onCopy={copyCV} onDownload={downloadCV} />
        </>
      )}
    </>
  )
}
