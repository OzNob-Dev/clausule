const THRESHOLDS = [
  { key: 'conductThreshold', label: 'Conduct / performance notes', min: 1, max: 10 },
  { key: 'escalationThreshold', label: 'Escalations', min: 1, max: 5 },
  { key: 'needsWorkWeeks', label: 'Weeks at Needs work', min: 1, max: 12 },
]

const WINDOWS = ['30 days', '60 days', '90 days', '6 months']

export default function AlertThresholdCard({ combined, onToggleCombined, values, onChangeThreshold, window, onChangeWindow }) {
  return (
    <div className="st-card">
      <div className="st-card-head">
        <div>
          <div className="st-card-title">Alert thresholds</div>
          <div className="st-card-sub">Configure when Clausule surfaces an alert for an employee.</div>
        </div>
        <div className="st-toggle-row">
          <span>Combined</span>
          <button
            type="button"
            className={`st-toggle${combined ? ' st-toggle--on' : ''}`}
            role="switch"
            aria-checked={combined}
            aria-label="Combined alerts"
            onClick={onToggleCombined}
          >
            <div className={`st-toggle-knob${combined ? ' st-toggle-knob--on' : ''}`} />
          </button>
        </div>
      </div>

      {THRESHOLDS.map(({ key, label, min, max }) => {
        const value = values[key]
        return (
          <div key={label} className="st-slider-row">
            <div className="st-slider-label">{label}</div>
            <div className="st-slider-track">
              <div className="st-slider-fill" style={{ width: `${((value - min) / (max - min)) * 100}%` }} />
              <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(event) => onChangeThreshold(key, Number(event.target.value))}
                className="st-slider-input"
                aria-label={label}
              />
            </div>
            <div className="st-slider-val">{value}</div>
          </div>
        )
      })}

      <div className="st-window-row">
        <div className="st-window-label">Time window</div>
        <div className="st-window-btns">
          {WINDOWS.map((currentWindow) => (
            <button
              key={currentWindow}
              onClick={() => onChangeWindow(currentWindow)}
              className={`st-window-btn${window === currentWindow ? ' st-window-btn--active' : ''}`}
            >
              {currentWindow}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
