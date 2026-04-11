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
        <div className="text-[13px] text-ts dark:text-[#9A9994] mb-4 bg-[rgba(0,0,0,0.03)] rounded px-3 py-2">
          {context}
        </div>
      )}

      {preDraft && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[11px] px-2 py-0.5 bg-blb text-blt rounded-full">AI draft</span>
          <span className="text-[11px] text-tm">Review and edit before sending</span>
        </div>
      )}

      <label className="block text-[11px] font-medium text-tm uppercase tracking-[0.5px] mb-1.5">
        Reason for escalation
      </label>
      <textarea
        value={reason}
        onChange={(e) => { setReason(e.target.value); setError(false) }}
        rows={4}
        placeholder="Describe the reason for escalating this to HR…"
        className={`w-full resize-none rounded-clausule border text-[13px] text-tp dark:text-tp-dark bg-card dark:bg-card-dark p-3 outline-none focus:border-bl transition-colors ${
          error ? 'border-[#E24B4A]' : 'border-[rgba(0,0,0,0.09)]'
        }`}
      />
      {error && (
        <p className="text-[11px] text-rt mt-1">Please provide a reason before escalating.</p>
      )}
    </Modal>
  )
}
