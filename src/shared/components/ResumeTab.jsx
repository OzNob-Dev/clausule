'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useProfileStore } from '@auth/store/useProfileStore'
import { Button } from '@shared/components/ui/Button'
import { profileDisplayName } from '@shared/utils/profile'
import { ThinkingDots } from '@shared/components/ui/ThinkingDots'
import { CopyIcon } from '@shared/components/ui/icon/CopyIcon'
import { DownloadIcon } from '@shared/components/ui/icon/DownloadIcon'
import { SparkleIcon } from '@shared/components/ui/icon/SparkleIcon'
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
    <Button type="button" onClick={onClick} disabled={disabled || generating} className="be-btn-generate inline-flex items-center gap-1.5 rounded-[var(--r)] bg-[var(--acc)] px-[18px] py-2.5 text-[var(--cl-text-sm)] font-bold text-[var(--cl-surface-paper)] shadow-none hover:opacity-90 disabled:cursor-default disabled:opacity-50 [&_svg]:h-3.5 [&_svg]:w-3.5">
      {generating ? (
        <>
          <ThinkingDots />
          <span>Generating…</span>
        </>
      ) : (
        <>
          <SparkleIcon />
          {visible ? 'Regenerate' : 'Generate resume'}
        </>
      )}
    </Button>
  )
}

function ResumeActions({ copied, onCopy, onDownload }) {
  return (
    <div className="be-cv-actions mt-[14px] flex items-center gap-2.5">
      <Button type="button" onClick={onCopy} className="be-cv-copy-btn inline-flex items-center gap-1.5 rounded-[var(--r)] border border-[var(--cl-border-2)] bg-[var(--cl-surface-paper)] px-[13px] py-[9px] text-[var(--cl-text-sm)] font-bold text-[var(--tm)] shadow-none [&_svg]:h-[13px] [&_svg]:w-[13px]" variant="ghost">
        <CopyIcon />
        Copy text
      </Button>
      <Button type="button" onClick={onDownload} className="be-cv-dl-btn inline-flex items-center gap-1.5 rounded-[var(--r)] border border-[var(--cl-border-2)] bg-[var(--cl-surface-paper)] px-[13px] py-[9px] text-[var(--cl-text-sm)] font-bold text-[var(--tm)] shadow-none [&_svg]:h-[13px] [&_svg]:w-[13px]" variant="ghost">
        <DownloadIcon />
        Download .txt
      </Button>
      <span className={`be-cv-copied text-[var(--cl-text-xs)] text-[var(--cl-success)] transition-opacity duration-200 ${copied ? 'be-cv-copied--show opacity-100' : 'opacity-0'}`} aria-live="polite">Copied</span>
    </div>
  )
}

export default function ResumeTab({ disabled = false, entries = [] }) {
  const profile = useProfileStore((state) => state.profile)
  const [cvVisible, setCvVisible] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [cvData, setCvData] = useState(() => buildInitialCv(profile, entries))
  const [cvCopied, setCvCopied] = useState(false)
  const [cvCopyError, setCvCopyError] = useState('')

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

  const copyCV = async () => {
    setCvCopyError('')
    try {
      await navigator.clipboard.writeText(getCVText())
      setCvCopied(true)
    } catch {
      setCvCopied(false)
      setCvCopyError('Could not copy resume text')
      return
    }
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
      <div className="be-cv-header mb-5 flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start">
        <div>
          <p className="be-cv-desc text-[var(--cl-text-md)] text-[var(--tm)]">Generate your resume from your brag doc entries.</p>
          <p className="be-cv-subdesc mt-0.5 text-[var(--cl-text-xs)] text-[var(--tm)]">Everything is editable — treat it as a living document you take with you.</p>
        </div>
        <GenerateButton disabled={disabled} generating={generating} visible={cvVisible} onClick={generateCV} />
      </div>

      {disabled && (
        <>
          <p className="be-cv-disabled-note mb-[14px] mt-[-8px] rounded-[var(--cl-radius-md)] border border-[var(--cl-accent-soft-6)] bg-[var(--cl-accent-soft)] px-[14px] py-3 text-[var(--cl-text-sm)] font-extrabold text-[var(--cl-accent-code)]">Add a brag entry to unlock resume generation.</p>
          <p className="be-cv-local-note mb-[14px] mt-[-8px] rounded-[var(--cl-radius-md)] border border-[var(--cl-border-2)] bg-[var(--cl-rule-2)] px-[14px] py-3 text-[var(--cl-text-sm)] font-bold text-[var(--cl-surface-muted-4)]">Resume edits stay only in this browser tab for now.</p>
          <ResumeDocument cvData={cvData} disabled onBulletChange={handleBulletChange} onFieldChange={handleFieldChange} />
        </>
      )}

      {!disabled && cvVisible && (
        <>
          <p className="be-cv-local-note mb-[14px] mt-[-8px] rounded-[var(--cl-radius-md)] border border-[var(--cl-border-2)] bg-[var(--cl-rule-2)] px-[14px] py-3 text-[var(--cl-text-sm)] font-bold text-[var(--cl-surface-muted-4)]">Resume edits stay only in this browser tab for now.</p>
          <ResumeDocument cvData={cvData} onBulletChange={handleBulletChange} onFieldChange={handleFieldChange} />
          <ResumeActions copied={cvCopied} onCopy={copyCV} onDownload={downloadCV} />
          {cvCopyError && <p className="be-comp-error" role="alert">{cvCopyError}</p>}
        </>
      )}
    </>
  )
}
