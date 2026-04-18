const ACTIONS = [
  { key: 'notifyHR', label: 'Notify HR team', sub: 'Sends an email to the HR distribution list' },
  { key: 'flagRecord', label: 'Flag employee record', sub: 'Adds a risk flag visible in the dashboard' },
  { key: 'notifyMgr', label: 'Notify line manager', sub: 'Sends a summary to the direct manager' },
  { key: 'autoSummary', label: 'Auto-generate HR summary', sub: 'Creates a draft summary for HR review' },
]

export default function AlertActionsCard({ actions, conductThreshold, escalationThreshold, onToggleAction, window }) {
  return (
    <div className="st-card">
      <div className="st-actions-title">When threshold is hit</div>
      <div className="st-actions-sub">
        Choose what happens automatically when an employee crosses a threshold.
      </div>
      {ACTIONS.map(({ key, label, sub }) => (
        <div key={key} className="st-action-item">
          <input
            type="checkbox"
            checked={actions[key]}
            onChange={() => onToggleAction(key)}
            className="st-action-checkbox"
            aria-label={label}
          />
          <div>
            <div className="st-action-label">{label}</div>
            <div className="st-action-sub">{sub}</div>
          </div>
        </div>
      ))}

      <div className="st-preview">
        <div className="st-preview-label">Preview notification</div>
        <div className="st-preview-text">
          An employee will be flagged after {conductThreshold} conduct/performance notes
          {' '}or {escalationThreshold} escalation{escalationThreshold !== 1 ? 's' : ''} within {window}.
        </div>
      </div>
    </div>
  )
}
