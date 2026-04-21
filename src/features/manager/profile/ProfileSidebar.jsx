import Link from 'next/link'

export default function ProfileSidebar({
  draftText,
  editingSummary,
  employee,
  entriesCount,
  escalated,
  onDraftChange,
  onDraftWithAi,
  onOpenEscalation,
  onSaveSummary,
  onSetEditingSummary,
  onSetPitstop,
  pitstop,
  pitstopSaved,
  summaryLoading,
  summarySaved,
  summaryText,
}) {
  const PITSTOP_OPTIONS = [
    { value: 'g', label: 'Going well' },
    { value: 'y', label: 'Working on it' },
    { value: 'r', label: 'Needs work' },
  ]

  return (
    <div className="pf-panel">
      <div className="pf-back-row">
        <Link href="/dashboard" className="pf-back-link">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="10 4 6 8 10 12" />
          </svg>
          Dashboard
        </Link>
      </div>

      <div className="pf-body">
        <div>
          <div className="pf-avatar">{employee.av}</div>
          <div className="pf-name">{employee.name}</div>
          <div className="pf-role">{employee.role} · {employee.team}</div>
        </div>

        <div className="pf-divider" />

        <div className="pf-meta-list">
          {[
            { label: 'Manager', val: 'A. Diente' },
            { label: 'Entries', val: `${entriesCount} total` },
          ].map(({ label, val }) => (
            <div key={label}>
              <div className="pf-section-label">{label}</div>
              <div className="pf-meta-val">{val}</div>
            </div>
          ))}
        </div>

        <div className="pf-divider" />

        <div>
          <div className="pf-pitstop-label">Pitstop</div>
          <div className="pf-pitstop-options">
            {PITSTOP_OPTIONS.map(({ value, label }) => {
              const isSelected = pitstop === value
              return (
                <button
                  key={value}
                  onClick={() => onSetPitstop(value)}
                  className={`pf-pitstop-btn pf-pitstop-btn--${value}${isSelected ? ' pf-pitstop-btn--sel' : ''}`}
                >
                  <span className="pf-pitstop-dot" />
                  {label}
                </button>
              )
            })}
          </div>
          {pitstopSaved && (
            <div className="pf-saved">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="3 8 6 11 13 4" />
              </svg>
              Saved
            </div>
          )}
        </div>

        <div className="pf-divider" />

        {!escalated ? (
          <button onClick={onOpenEscalation} className="pf-escalate-btn">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z" />
            </svg>
            Escalate to HR
          </button>
        ) : (
          <div className="pf-escalated-indicator">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z" />
            </svg>
            Escalated
          </div>
        )}

        <div className="pf-divider" />

        <div>
          <div className="pf-summary-label">Manager summary</div>
          {editingSummary ? (
            <>
              <textarea
                value={draftText}
                onChange={(event) => onDraftChange(event.target.value)}
                rows={5}
                className="pf-summary-textarea"
              />
              <div className="pf-summary-actions">
                <button onClick={onDraftWithAi} disabled={summaryLoading} className="pf-btn-ai-draft">
                  {summaryLoading ? 'Drafting…' : 'AI draft'}
                </button>
                <button onClick={() => onSetEditingSummary(false)} className="pf-btn-summary-cancel">
                  Cancel
                </button>
                <button onClick={onSaveSummary} className="pf-btn-summary-save">
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <button type="button" onClick={() => onSetEditingSummary(true)} className="pf-summary-view">
                {summaryText}
              </button>
              <div className="pf-summary-hint">Click to edit · auto-saves</div>
              {summarySaved && (
                <div className="pf-auto-saved">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="3 8 6 11 13 4" />
                  </svg>
                  Auto-saved
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
