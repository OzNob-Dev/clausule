'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { profileDisplayName } from '@shared/utils/profile'
import { ThinkingDots } from '@shared/components/ui/ThinkingDots'
import ResumeDocument from './ResumeDocument'

function bulletFromEntry(entry) {
  return [entry.title, entry.body].filter(Boolean).join(' — ').trim()
}

function generatedBullets(entries = []) {
  const bullets = entries.map(bulletFromEntry).filter(Boolean).slice(0, 3)
  while (bullets.length < 3) bullets.push('')
  return bullets
}

function buildInitialCv(profile, entries = []) {
  const displayName = profileDisplayName(profile)
  const tagline = [profile.jobTitle, profile.department].filter(Boolean).join(' — ') || 'Add your professional summary'
  const contact = [profile.email, profile.mobile, profile.department].filter(Boolean).join(' · ')
  const company = profile.department || 'Team or business unit'

  return {
    name: displayName === 'Your profile' ? '' : displayName,
    tagline,
    contact,
    jobTitle: profile.jobTitle || 'Current role title',
    jobMeta: 'Current role · Edit dates',
    company,
    education: 'Add your degree',
    educationDates: 'Add study dates',
    institution: 'Add your institution',
    bullets: generatedBullets(entries),
  }
}

function GenerateButton({ disabled, generating, visible, onClick }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled || generating} className="be-btn-generate">
      {generating ? (
        <>
          <ThinkingDots />
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
      <button type="button" onClick={onCopy} className="be-cv-copy-btn">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="5" y="5" width="9" height="9" rx="1"/>
          <path d="M3 11V3a1 1 0 0 1 1-1h8"/>
        </svg>
        Copy text
      </button>
      <button type="button" onClick={onDownload} className="be-cv-dl-btn">
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

export default function ResumeTab({ disabled = false, entries = [] }) {
  const profile = useProfileStore((state) => state.profile)
  const [cvVisible, setCvVisible] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [cvData, setCvData] = useState(() => buildInitialCv(profile, entries))
  const [cvCopied, setCvCopied] = useState(false)

  const generateTimerRef = useRef(null)
  const copyTimerRef = useRef(null)

  useEffect(() => () => {
    if (generateTimerRef.current) clearTimeout(generateTimerRef.current)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
  }, [])

  useEffect(() => {
    if (cvVisible) return
    setCvData(buildInitialCv(profile, entries))
  }, [cvVisible, entries, profile])

  const handleFieldChange = useCallback((field) => (event) => {
    const nextValue = event.target.value
    setCvData((prev) => (prev[field] === nextValue ? prev : { ...prev, [field]: nextValue }))
  }, [])

  const handleBulletChange = useCallback((index) => (event) => {
    const nextValue = event.target.value
    setCvData((prev) => ({
      ...prev,
        bullets: prev.bullets.map((bullet, bulletIndex) => (bulletIndex === index ? nextValue : bullet)),
      }))
  }, [])

  const generateCV = () => {
    if (disabled) return
    setGenerating(true)
    if (generateTimerRef.current) clearTimeout(generateTimerRef.current)

    generateTimerRef.current = setTimeout(() => {
      setGenerating(false)
      setCvData((prev) => ({
        ...buildInitialCv(profile, entries),
        ...prev,
        bullets: generatedBullets(entries),
      }))
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
          <p className="be-cv-local-note">Resume edits stay only in this browser tab for now.</p>
          <ResumeDocument cvData={cvData} disabled onBulletChange={handleBulletChange} onFieldChange={handleFieldChange} />
        </>
      )}

      {!disabled && cvVisible && (
        <>
          <p className="be-cv-local-note">Resume edits stay only in this browser tab for now.</p>
          <ResumeDocument cvData={cvData} onBulletChange={handleBulletChange} onFieldChange={handleFieldChange} />
          <ResumeActions copied={cvCopied} onCopy={copyCV} onDownload={downloadCV} />
        </>
      )}
    </>
  )
}
