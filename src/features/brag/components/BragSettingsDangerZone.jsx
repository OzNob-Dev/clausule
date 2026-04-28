export default function BragSettingsDangerZone({ onDelete }) {
  return (
    <div className="bss-danger-section">
      <div className="bss-danger-label">Danger zone</div>
      <div className="bss-danger-card">
        <div className="bss-danger-row">
          <div>
            <div className="bss-danger-title">Delete account</div>
            <div className="bss-danger-desc">
              Permanently removes your account and all brag doc entries, files, and records. This cannot be undone.
            </div>
          </div>
          <button type="button" className="bss-btn-delete" onClick={onDelete}>
            Delete account
          </button>
        </div>
      </div>
    </div>
  )
}
