export function ProfileActions({ onReset, saving = false, disabled = false }) {
  return (
    <div className="form-actions">
      <button className="btn-reset" type="button" onClick={onReset} disabled={saving || disabled}>Reset</button>
      <button className="btn-save" type="submit" disabled={saving || disabled}>
        <svg viewBox="0 0 14 14" aria-hidden="true"><polyline points="2,7 5.5,10.5 12,3" /></svg>
        Save changes
      </button>
    </div>
  )
}
