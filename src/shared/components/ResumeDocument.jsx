import { FieldInput, FieldTextarea } from '@shared/components/ui/Field'

function EditableField({ ariaLabel, className, disabled, field, multiline = false, onChange, value }) {
  const Component = multiline ? FieldTextarea : FieldInput

  return (
    <Component
      value={value}
      onChange={disabled ? undefined : onChange(field)}
      className={`${className} be-cv-editable`}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      aria-multiline={multiline || undefined}
      disabled={disabled}
      rows={multiline ? 2 : undefined}
      type={multiline ? undefined : 'text'}
    />
  )
}

export default function ResumeDocument({ cvData, disabled = false, onBulletChange, onFieldChange }) {
  return (
    <div className={`be-cv-card rounded-[18px] border border-[var(--cl-border)] bg-[var(--cl-surface-paper)] px-[30px] py-7 ${disabled ? 'be-cv-card--disabled pointer-events-none select-none opacity-[0.58]' : ''}`} aria-disabled={disabled || undefined}>
      <EditableField disabled={disabled} field="name" className="be-cv-name block text-[30px] font-black tracking-[-0.8px] text-[var(--cl-surface-ink)] outline-none" ariaLabel="Full name" onChange={onFieldChange} value={cvData.name} />
      <EditableField disabled={disabled} field="tagline" className="be-cv-tagline mt-1.5 block text-[var(--cl-text-base)] leading-[1.6] text-[var(--tm)] outline-none" ariaLabel="Professional tagline" multiline onChange={onFieldChange} value={cvData.tagline} />
      <EditableField disabled={disabled} field="contact" className="be-cv-contact mt-2 block text-[var(--cl-text-sm)] text-[var(--tm)] outline-none" ariaLabel="Contact info" onChange={onFieldChange} value={cvData.contact} />

      <div className="be-cv-rule my-[22px] h-px bg-[var(--cl-rule)]" aria-hidden="true" />
      <div className="be-cv-section-label mb-3 text-[var(--cl-text-2xs)] font-bold uppercase tracking-[0.8px] text-[var(--tm)]">Experience</div>

      <div className="be-cv-job">
        <div className="be-cv-job-header flex items-baseline justify-between gap-[18px]">
          <EditableField disabled={disabled} field="jobTitle" className="be-cv-job-title block text-[var(--cl-text-xl)] font-bold text-[var(--cl-surface-ink)] outline-none" ariaLabel="Job title" onChange={onFieldChange} value={cvData.jobTitle} />
          <EditableField disabled={disabled} field="jobMeta" className="be-cv-dates block whitespace-nowrap text-right text-[var(--cl-text-sm)] text-[var(--tm)] outline-none" ariaLabel="Employment dates" onChange={onFieldChange} value={cvData.jobMeta} />
        </div>
        <EditableField disabled={disabled} field="company" className="be-cv-company mt-1 block text-[var(--cl-text-md)] text-[var(--tm)] outline-none" ariaLabel="Company" onChange={onFieldChange} value={cvData.company} />
        <ul className="be-cv-bullets mt-[14px] flex list-none flex-col gap-2 p-0" aria-label="Accomplishments">
          {cvData.bullets.map((bullet, index) => (
            <li key={index} className="be-cv-bullet-li flex items-start gap-2">
              <span className="be-cv-bullet-marker shrink-0 text-[var(--tm)]" aria-hidden="true">·</span>
              <FieldTextarea
                rows={2}
                value={bullet}
                onChange={disabled ? undefined : onBulletChange(index)}
                className="be-cv-bullet be-cv-editable block w-full resize-none border-none bg-transparent p-0 text-[var(--cl-text-md)] leading-[1.55] text-[var(--cl-surface-ink)] outline-none focus:outline-[2px] focus:outline-[var(--cl-accent-alpha-28)] focus:outline-offset-4"
                aria-label={`Accomplishment ${index + 1}`}
                aria-disabled={disabled || undefined}
                disabled={disabled}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="be-cv-rule my-[22px] h-px bg-[var(--cl-rule)]" aria-hidden="true" />
      <div className="be-cv-section-label mb-3 text-[var(--cl-text-2xs)] font-bold uppercase tracking-[0.8px] text-[var(--tm)]">Education</div>

      <div className="be-cv-job-header flex items-baseline justify-between gap-[18px]">
        <EditableField disabled={disabled} field="education" className="be-cv-job-title block text-[var(--cl-text-xl)] font-bold text-[var(--cl-surface-ink)] outline-none" ariaLabel="Degree" onChange={onFieldChange} value={cvData.education} />
        <EditableField disabled={disabled} field="educationDates" className="be-cv-dates block whitespace-nowrap text-right text-[var(--cl-text-sm)] text-[var(--tm)] outline-none" ariaLabel="Study dates" onChange={onFieldChange} value={cvData.educationDates} />
      </div>
      <EditableField disabled={disabled} field="institution" className="be-cv-company mt-1 block text-[var(--cl-text-md)] text-[var(--tm)] outline-none" ariaLabel="Institution" onChange={onFieldChange} value={cvData.institution} />
    </div>
  )
}
