import { useState } from 'react'

const reminderMethods = [
  { value: 'email', label: 'Email', desc: 'Send reminders to the inbox tied to this account.' },
  { value: 'sms', label: 'SMS', desc: 'Send reminders by text message to the mobile number on file.' },
]

const reminderFrequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
]

export default function DeleteAccountSection({
  confirmReady,
  deleteConfirmText,
  deleteModal,
  onCancelDelete,
  onChangeConfirmText,
  onCloseModal,
  onConfirmDelete,
  onOpenDelete,
}) {
  const [reminderMethod, setReminderMethod] = useState('email')
  const [reminderFrequency, setReminderFrequency] = useState('weekly')

  return (
    <>
      <div className="st-reminder-section">
        <div className="st-reminder-label">Reminder preferences</div>
        <div className="st-reminder-card">
          <div className="st-reminder-head">
            <div>
              <div className="st-reminder-title">Delivery and frequency</div>
              <div className="st-reminder-desc">
                Choose whether reminders arrive by email or SMS, then set how often they repeat.
              </div>
            </div>
            <div className="st-reminder-summary" aria-live="polite">
              {reminderMethod.toUpperCase()} · {reminderFrequency}
            </div>
          </div>

          <fieldset className="st-reminder-group">
            <legend className="st-reminder-legend">Delivery method</legend>
            <div className="st-reminder-grid">
              {reminderMethods.map(({ value, label, desc }) => (
                <label key={value} className={`st-reminder-option${reminderMethod === value ? ' st-reminder-option--active' : ''}`}>
                  <input
                    className="st-reminder-input"
                    type="radio"
                    name="reminder-method"
                    value={value}
                    checked={reminderMethod === value}
                    onChange={() => setReminderMethod(value)}
                    aria-label={label}
                  />
                  <div className="st-reminder-option-body">
                    <div className="st-reminder-option-title">{label}</div>
                    <div className="st-reminder-option-desc">{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="st-reminder-group">
            <legend className="st-reminder-legend">Reminder frequency</legend>
            <div className="st-frequency-grid">
              {reminderFrequencies.map(({ value, label }) => (
                <label key={value} className={`st-frequency-option${reminderFrequency === value ? ' st-frequency-option--active' : ''}`}>
                  <input
                    className="st-reminder-input"
                    type="radio"
                    name="reminder-frequency"
                    value={value}
                    checked={reminderFrequency === value}
                    onChange={() => setReminderFrequency(value)}
                    aria-label={label}
                  />
                  <span className="st-frequency-text">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="st-danger-section">
        <div className="st-danger-label">Danger zone</div>
        <div className="st-danger-card">
          <div className="st-danger-inner">
            <div>
              <div className="st-danger-title">Delete account</div>
              <div className="st-danger-desc">
                Permanently remove your account and all associated data. This cannot be undone.
              </div>
            </div>
            <button onClick={onOpenDelete} className="st-btn-delete-account">
              Delete account
            </button>
          </div>
        </div>
      </div>

      {deleteModal && (
        <div className="st-modal-overlay" onClick={(event) => event.target === event.currentTarget && onCloseModal()}>
          <div className="st-modal">
            <div className="st-modal-icon">
              <svg viewBox="0 0 20 20" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round" style={{ width: 20, height: 20 }}>
                <polyline points="3 6 5 6 17 6" />
                <path d="M8 6V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" />
                <path d="M16 6l-1 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                <line x1="10" y1="11" x2="10" y2="15" />
                <line x1="8" y1="11" x2="8" y2="15" />
                <line x1="12" y1="11" x2="12" y2="15" />
              </svg>
            </div>

            <div className="st-modal-title">Delete your account?</div>
            <div className="st-modal-body">
              This will <strong>permanently delete</strong> your account and remove all associated data — including every entry, note, and file record — from our servers. This action <strong style={{ color: 'var(--red)' }}>cannot be undone</strong>.
            </div>

            <div className="st-modal-confirm">
              <label className="st-confirm-label">
                Type <span>DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(event) => onChangeConfirmText(event.target.value)}
                placeholder="DELETE"
                autoFocus
                className="st-confirm-input"
              />
            </div>

            <div className="st-modal-actions">
              <button
                disabled={!confirmReady}
                onClick={onConfirmDelete}
                className={`st-btn-confirm${confirmReady ? ' st-btn-confirm--ready' : ''}`}
              >
                Yes, permanently delete my account
              </button>
              <button onClick={onCancelDelete} className="st-btn-modal-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
