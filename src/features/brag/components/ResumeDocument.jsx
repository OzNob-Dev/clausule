function EditableField({ ariaLabel, className, disabled, field, multiline = false, onChange, value }) {
  const Component = multiline ? 'textarea' : 'input'

  return (
    <Component
      type={multiline ? undefined : 'text'}
      rows={multiline ? 2 : undefined}
      value={value}
      onChange={disabled ? undefined : onChange(field)}
      className={`${className} be-cv-editable`}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      aria-multiline={multiline || undefined}
      disabled={disabled}
    />
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

export default function ResumeDocument({ cvData, autosaved, disabled = false, onBulletChange, onFieldChange }) {
  return (
    <div className={`be-cv-card${disabled ? ' be-cv-card--disabled' : ''}`} aria-disabled={disabled || undefined}>
      <AutosaveBadge visible={autosaved} />

      <EditableField disabled={disabled} field="name" className="be-cv-name" ariaLabel="Full name" onChange={onFieldChange} value={cvData.name} />
      <EditableField disabled={disabled} field="tagline" className="be-cv-tagline" ariaLabel="Professional tagline" multiline onChange={onFieldChange} value={cvData.tagline} />
      <EditableField disabled={disabled} field="contact" className="be-cv-contact" ariaLabel="Contact info" onChange={onFieldChange} value={cvData.contact} />

      <div className="be-cv-rule" aria-hidden="true" />
      <div className="be-cv-section-label">Experience</div>

      <div className="be-cv-job">
        <div className="be-cv-job-header">
          <EditableField disabled={disabled} field="jobTitle" className="be-cv-job-title" ariaLabel="Job title" onChange={onFieldChange} value={cvData.jobTitle} />
          <EditableField disabled={disabled} field="jobMeta" className="be-cv-dates" ariaLabel="Employment dates" onChange={onFieldChange} value={cvData.jobMeta} />
        </div>
        <EditableField disabled={disabled} field="company" className="be-cv-company" ariaLabel="Company" onChange={onFieldChange} value={cvData.company} />
        <ul className="be-cv-bullets" aria-label="Accomplishments">
          {cvData.bullets.map((bullet, index) => (
            <li key={index} className="be-cv-bullet-li">
              <span className="be-cv-bullet-marker" aria-hidden="true">·</span>
              <textarea
                rows={2}
                value={bullet}
                onChange={disabled ? undefined : onBulletChange(index)}
                className="be-cv-bullet be-cv-editable"
                aria-label={`Accomplishment ${index + 1}`}
                aria-disabled={disabled || undefined}
                disabled={disabled}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="be-cv-rule" aria-hidden="true" />
      <div className="be-cv-section-label">Education</div>

      <div className="be-cv-job-header">
        <EditableField disabled={disabled} field="education" className="be-cv-job-title" ariaLabel="Degree" onChange={onFieldChange} value={cvData.education} />
        <EditableField disabled={disabled} field="educationDates" className="be-cv-dates" ariaLabel="Study dates" onChange={onFieldChange} value={cvData.educationDates} />
      </div>
      <EditableField disabled={disabled} field="institution" className="be-cv-company" ariaLabel="Institution" onChange={onFieldChange} value={cvData.institution} />
    </div>
  )
}
