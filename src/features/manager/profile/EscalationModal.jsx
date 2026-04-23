import { useState } from 'react'
import { Modal } from '@shared/components/ui/Modal'
import { Button } from '@shared/components/ui/Button'
import { cn } from '@shared/utils/cn'

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
        <div className="mb-4 rounded-[var(--r)] border border-rule bg-[rgba(255,255,255,0.04)] px-3 py-2 text-[13px] leading-[1.65] text-tm">{context}</div>
      )}

      {preDraft && (
        <div className="mb-4 flex items-center gap-2 text-[11px] text-tm">
          <span className="rounded-full bg-acc-bg px-2 py-1 font-bold text-acc-text">AI draft</span>
          <span>Review and edit before sending</span>
        </div>
      )}

      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.6px] text-tm">Reason for escalation</label>
      <textarea
        value={reason}
        onChange={(e) => { setReason(e.target.value); setError(false) }}
        rows={4}
        placeholder="Describe the reason for escalating this to HR…"
        className={cn('mb-4 w-full resize-none rounded-[var(--r)] border-[1.5px] border-rule bg-canvas px-[13px] py-[11px] font-sans text-[14px] text-tp outline-none transition-colors duration-200 focus:border-acc-text', error && 'border-red')}
      />
      {error && (
        <p className="text-[12px] font-medium text-red">Please provide a reason before escalating.</p>
      )}
    </Modal>
  )
}
