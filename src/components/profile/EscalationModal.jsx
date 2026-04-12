import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import '../../styles/escalation-modal.css'

export function EscalationModal({ open, onClose, onConfirm, context, preDraft = '' }) {
  const [reason, setReason] = useState(preDraft)
  const [error, setError] = useState(false)

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError(true)
      return
    }
    setError(false)
    onConfirm(reason)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Escalate to HR"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="confirm" onClick={handleConfirm}>Confirm escalation</Button>
        </>
      }
    >
      {context && (
        <div className="em-context">{context}</div>
      )}

      {preDraft && (
        <div className="em-draft-row">
          <span className="em-draft-badge">AI draft</span>
          <span className="em-draft-hint">Review and edit before sending</span>
        </div>
      )}

      <label className="em-label">Reason for escalation</label>
      <textarea
        value={reason}
        onChange={(e) => { setReason(e.target.value); setError(false) }}
        rows={4}
        placeholder="Describe the reason for escalating this to HR…"
        className={`em-textarea${error ? ' em-textarea--error' : ''}`}
      />
      {error && (
        <p className="em-error">Please provide a reason before escalating.</p>
      )}
    </Modal>
  )
}
