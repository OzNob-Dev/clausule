import { bragSettingsUi } from './bragClasses'

export default function BragSettingsDangerZone({ onDelete }) {
  return (
    <div className={bragSettingsUi.dangerSection}>
      <div className={bragSettingsUi.dangerLabel}>Danger zone</div>
      <div className={bragSettingsUi.dangerCard}>
        <div className={bragSettingsUi.dangerRow}>
          <div>
            <div className={bragSettingsUi.dangerTitle}>Delete account</div>
            <div className={bragSettingsUi.dangerDesc}>
              Permanently removes your account and all brag doc entries, files, and records. This cannot be undone.
            </div>
          </div>
          <button className={bragSettingsUi.deleteBtn} onClick={onDelete}>
            Delete account
          </button>
        </div>
      </div>
    </div>
  )
}
