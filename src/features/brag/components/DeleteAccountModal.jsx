'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@features/auth/context/AuthContext'
import { cn } from '@shared/utils/cn'
import { Modal } from '@shared/components/ui/Modal'
import { apiFetch } from '@shared/utils/api'

export default function DeleteAccountModal({ open, onClose }) {
  const { logout } = useAuth()
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const inputRef = useRef(null)

  const confirmReady = deleteConfirm === 'DELETE'

  const handleConfirm = async () => {
    if (!confirmReady) {
      inputRef.current?.animate?.(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }],
        { duration: 320, easing: 'ease-in-out' }
      )
      return
    }

    setDeleting(true)
    setDeleteError('')

    try {
      const response = await apiFetch('/api/account', {
        method: 'DELETE',
      }, { retryOnUnauthorized: false })

      if (!response.ok) throw new Error('Delete failed')
      await logout()
    } catch {
      setDeleteError('Could not delete your account. Please try again.')
      setDeleting(false)
    }
  }

  const handleClose = () => {
    setDeleteConfirm('')
    setDeleteError('')
    setDeleting(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={null}
      footer={null}
      dialogClassName="max-w-[34rem] border-none bg-transparent"
      labelledBy="delete-modal-title"
      describedBy="delete-modal-description"
    >
      <div className={cn('w-full max-w-[34rem] rounded-[var(--r2)] border border-rule-em bg-card p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)]')}>
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-red/20 bg-red-bg text-red" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-[18px] w-[18px]">
            <polyline points="3 6 5 6 17 6"/>
            <path d="M8 6V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/>
            <path d="M16 6l-1 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/>
            <line x1="10" y1="11" x2="10" y2="15"/>
            <line x1="8"  y1="11" x2="8"  y2="15"/>
            <line x1="12" y1="11" x2="12" y2="15"/>
          </svg>
        </div>
        <div className="text-[18px] font-bold tracking-[-0.3px] text-tp" id="delete-modal-title">Delete your account?</div>
        <div className="mt-3 text-[14px] leading-[1.7] text-tm" id="delete-modal-description">
          This will <strong>permanently delete</strong> your brag doc and all associated entries, evidence files, and records from our servers. This action <strong>cannot be undone</strong>.
        </div>
        <div className="mb-5 mt-5">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.6px] text-tm" htmlFor="delete-confirm-input">
            Type <span>DELETE</span> to confirm
          </label>
          <input
            id="delete-confirm-input"
            ref={inputRef}
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
            autoFocus
            className="block box-border min-w-0 w-full rounded-[var(--r)] border-[1.5px] border-rule-em bg-canvas px-[13px] py-[11px] font-sans text-[15px] font-medium text-tp outline-none transition-colors duration-200 placeholder:text-tm focus:border-red"
          />
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={handleConfirm} disabled={deleting} className={cn('rounded-[var(--r)] border-none px-4 py-3 text-[14px] font-bold text-[#FAF7F3] cursor-pointer transition-opacity duration-150 disabled:cursor-default disabled:opacity-60', confirmReady ? 'bg-red' : 'bg-red/70')}>
            {deleting ? 'Deleting account...' : 'Yes, permanently delete my account'}
          </button>
          <button type="button" className="rounded-[var(--r)] border border-rule bg-transparent px-4 py-3 text-[14px] font-bold text-tp cursor-pointer transition-colors duration-150 hover:border-tp disabled:cursor-default disabled:opacity-60" onClick={handleClose} disabled={deleting}>
            Cancel
          </button>
        </div>
        {deleteError && <p className="mt-4 text-[12px] font-medium text-red" role="alert">{deleteError}</p>}
      </div>
    </Modal>
  )
}
