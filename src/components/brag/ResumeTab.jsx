import { useState, useRef } from 'react'

export default function ResumeTab() {
  const [cvVisible, setCvVisible]   = useState(false)
  const [generating, setGenerating] = useState(false)
  const [cvBullets, setCvBullets]   = useState([])
  const [cvAutosaved, setCvAutosaved] = useState(false)
  const [cvCopied, setCvCopied]     = useState(false)
  const autosaveTimer               = useRef(null)

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
    const name     = document.getElementById('cv-name')?.textContent     || 'Jordan Ellis'
    const tagline  = document.getElementById('cv-tagline')?.textContent  || ''
    const contact  = document.getElementById('cv-contact')?.textContent  || ''
    const jobTitle = document.getElementById('cv-job-title')?.textContent || ''
    const jobMeta  = document.getElementById('cv-job-meta')?.textContent  || ''
    const company  = document.getElementById('cv-company')?.textContent  || ''
    const bullets  = [...(document.querySelectorAll('.be-cv-bullet-li') || [])].map((li) => '• ' + li.textContent).join('\n')
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
    <>
      <div className="be-cv-header">
        <div>
          <p className="be-cv-desc">Generate your resume from your brag doc entries.</p>
          <p className="be-cv-subdesc">Everything is editable — treat it as a living document you take with you.</p>
        </div>
        <button onClick={generateCV} disabled={generating} className="be-btn-generate">
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
              {cvVisible ? 'Regenerate' : 'Generate resume'}
            </>
          )}
        </button>
      </div>

      {cvVisible && (
        <>
          <div className="be-cv-card">
            <div className={`be-cv-autosave${cvAutosaved ? ' be-cv-autosave--show' : ''}`} aria-live="polite" aria-atomic="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <polyline points="3 8 6 11 13 4"/>
              </svg>
              Autosaved
            </div>

            <span id="cv-name" contentEditable suppressContentEditableWarning onInput={scheduleAutosave} className="be-cv-name" role="textbox" aria-label="Full name" aria-multiline="false">Jordan Ellis</span>
            <span id="cv-tagline" contentEditable suppressContentEditableWarning onInput={scheduleAutosave} className="be-cv-tagline" role="textbox" aria-label="Professional tagline" aria-multiline="false">Senior software engineer — platform infrastructure, distributed systems, technical leadership</span>
            <span id="cv-contact" contentEditable suppressContentEditableWarning onInput={scheduleAutosave} className="be-cv-contact" role="textbox" aria-label="Contact info" aria-multiline="false">jordan.ellis@acmecorp.com · Platform team · Acme Corp</span>

            <div className="be-cv-rule" aria-hidden="true" />
            <div className="be-cv-section-label">Experience</div>

            <div className="be-cv-job">
              <div className="be-cv-job-header">
                <span id="cv-job-title" contentEditable suppressContentEditableWarning onInput={scheduleAutosave} className="be-cv-job-title" role="textbox" aria-label="Job title" aria-multiline="false">Senior engineer</span>
                <span id="cv-job-meta" contentEditable suppressContentEditableWarning onInput={scheduleAutosave} className="be-cv-dates" role="textbox" aria-label="Employment dates" aria-multiline="false">Acme Corp · Mar 2022–present</span>
              </div>
              <span id="cv-company" contentEditable suppressContentEditableWarning onInput={scheduleAutosave} className="be-cv-company" role="textbox" aria-label="Company" aria-multiline="false">Platform team</span>
              <ul className="be-cv-bullets" aria-label="Accomplishments">
                {cvBullets.map((b, i) => (
                  <li key={i} contentEditable suppressContentEditableWarning onInput={scheduleAutosave} className="be-cv-bullet be-cv-bullet-li">
                    <span className="be-cv-bullet-marker" aria-hidden="true">·</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="be-cv-rule" aria-hidden="true" />
            <div className="be-cv-section-label">Education</div>

            <div className="be-cv-job-header">
              <span contentEditable suppressContentEditableWarning onInput={scheduleAutosave} className="be-cv-job-title" role="textbox" aria-label="Degree" aria-multiline="false">Bachelor of Computer Science</span>
              <span contentEditable suppressContentEditableWarning onInput={scheduleAutosave} className="be-cv-dates" role="textbox" aria-label="Study dates" aria-multiline="false">2018–2022</span>
            </div>
            <span contentEditable suppressContentEditableWarning onInput={scheduleAutosave} className="be-cv-company" role="textbox" aria-label="Institution" aria-multiline="false">University of Technology · Click to edit</span>
          </div>

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
            <span className={`be-cv-copied${cvCopied ? ' be-cv-copied--show' : ''}`} aria-live="polite">Copied</span>
          </div>
        </>
      )}
    </>
  )
}
