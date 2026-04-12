import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

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
        <div className="text-[13px] text-[var(--ts)] mb-4 rounded-clausule px-3 py-2 bg-[rgba(255,255,255,0.04)]">
          {context}
        </div>
      )}

      {preDraft && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-[var(--blb)] text-[var(--blt)]">
            AI draft
          </span>
          <span className="text-[11px] text-[var(--tm)]">Review and edit before sending</span>
        </div>
      )}

      <label className="block text-[11px] font-bold uppercase tracking-[0.5px] mb-1.5 text-[var(--tm)]">
        Reason for escalation
      </label>
      <textarea
        value={reason}
        onChange={(e) => { setReason(e.target.value); setError(false) }}
        rows={4}
        placeholder="Describe the reason for escalating this to HR…"
        className={`w-full resize-none rounded-clausule text-[13px] text-[var(--tp)] p-3 outline-none transition-colors bg-[rgba(255,255,255,0.04)] border ${
          error ? 'border-[var(--rt)]' : 'border-[var(--rule)]'
        }`}
      />
      {error && (
        <p className="text-[11px] mt-1 text-[var(--rt)]">Please provide a reason before escalating.</p>
      )}
    </Modal>
  )
}
