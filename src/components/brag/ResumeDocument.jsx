function EditableField({ ariaLabel, children, className, field, onInput }) {
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onInput={onInput(field)}
      className={className}
      role="textbox"
      aria-label={ariaLabel}
      aria-multiline="false"
    >
      {children}
    </span>
  )
}

function AutosaveBadge({ visible }) {
  return (
    <div className={`be-cv-autosave${visible ? ' be-cv-autosave--show' : ''}`} aria-live="polite" aria-atomic="true">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <polyline points="3 8 6 11 13 4"/>
      </svg>
      Autosaved
    </div>
  )
}

export default function ResumeDocument({ cvData, autosaved, onBulletInput, onFieldInput }) {
  return (
    <div className="be-cv-card">
      <AutosaveBadge visible={autosaved} />

      <EditableField field="name" className="be-cv-name" ariaLabel="Full name" onInput={onFieldInput}>{cvData.name}</EditableField>
      <EditableField field="tagline" className="be-cv-tagline" ariaLabel="Professional tagline" onInput={onFieldInput}>{cvData.tagline}</EditableField>
      <EditableField field="contact" className="be-cv-contact" ariaLabel="Contact info" onInput={onFieldInput}>{cvData.contact}</EditableField>

      <div className="be-cv-rule" aria-hidden="true" />
      <div className="be-cv-section-label">Experience</div>

      <div className="be-cv-job">
        <div className="be-cv-job-header">
          <EditableField field="jobTitle" className="be-cv-job-title" ariaLabel="Job title" onInput={onFieldInput}>{cvData.jobTitle}</EditableField>
          <EditableField field="jobMeta" className="be-cv-dates" ariaLabel="Employment dates" onInput={onFieldInput}>{cvData.jobMeta}</EditableField>
        </div>
        <EditableField field="company" className="be-cv-company" ariaLabel="Company" onInput={onFieldInput}>{cvData.company}</EditableField>
        <ul className="be-cv-bullets" aria-label="Accomplishments">
          {cvData.bullets.map((bullet, index) => (
            <li key={index} contentEditable suppressContentEditableWarning onInput={onBulletInput(index)} className="be-cv-bullet be-cv-bullet-li">
              <span className="be-cv-bullet-marker" aria-hidden="true">·</span>
              {bullet}
            </li>
          ))}
        </ul>
      </div>

      <div className="be-cv-rule" aria-hidden="true" />
      <div className="be-cv-section-label">Education</div>

      <div className="be-cv-job-header">
        <EditableField field="education" className="be-cv-job-title" ariaLabel="Degree" onInput={onFieldInput}>{cvData.education}</EditableField>
        <EditableField field="educationDates" className="be-cv-dates" ariaLabel="Study dates" onInput={onFieldInput}>{cvData.educationDates}</EditableField>
      </div>
      <EditableField field="institution" className="be-cv-company" ariaLabel="Institution" onInput={onFieldInput}>{cvData.institution}</EditableField>
    </div>
  )
}
