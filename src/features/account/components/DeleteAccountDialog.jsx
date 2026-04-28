'use client'

import { useRef, useState } from 'react'
import { Modal } from '@shared/components/ui/Modal'
import { cn } from '@shared/utils/cn'
import { useDeleteAccount } from '@features/account/hooks/useDeleteAccount'

const DEFAULT_DESCRIPTION =
  'This will permanently delete your account and remove the records connected to it from our servers. This action cannot be undone.'

export function DeleteAccountDialog({ open, onClose, description = DEFAULT_DESCRIPTION }) {
  const inputRef = useRef(null)
  const { deleteAccount, deleting } = useDeleteAccount()
  const [confirmText, setConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const confirmReady = confirmText === 'DELETE'

  const reset = () => {
    setConfirmText('')
    setDeleteError('')
  }

  const handleClose = () => {
    if (deleting) return
    reset()
    onClose()
  }

  const handleConfirm = async () => {
    if (!confirmReady) {
      inputRef.current?.animate?.(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(4px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 320, easing: 'ease-in-out' }
      )
      return
    }

    setDeleteError('')

    try {
      await deleteAccount()
    } catch {
      setDeleteError('Could not delete your account. Please try again.')
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={null}
      footer={null}
      dialogClassName="max-w-[34rem] border-none bg-transparent"
      labelledBy="delete-account-dialog-title"
      describedBy="delete-account-dialog-description"
    >
      <div className={cn('w-full max-w-[34rem] rounded-[var(--r2)] border border-[rgba(60,45,35,0.28)] bg-white p-6 shadow-[0_32px_96px_rgba(0,0,0,0.26)]')}>
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-red/50 bg-red/20 text-red" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-[18px] w-[18px]">
            <polyline points="3 6 5 6 17 6" />
            <path d="M8 6V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" />
            <path d="M16 6l-1 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
            <line x1="10" y1="11" x2="10" y2="15" />
            <line x1="8" y1="11" x2="8" y2="15" />
            <line x1="12" y1="11" x2="12" y2="15" />
          </svg>
        </div>

        <div className="text-[18px] font-bold tracking-[-0.3px] text-tp" id="delete-account-dialog-title">Delete your account?</div>
        <div className="mt-3 text-[14px] leading-[1.7] text-tm" id="delete-account-dialog-description">
          {description}
        </div>

        <div className="mb-5 mt-5">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.6px] text-tm" htmlFor="delete-confirm-input">
            Type <span>DELETE</span> to confirm
          </label>
          <input
            id="delete-confirm-input"
            ref={inputRef}
            type="text"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="DELETE"
            autoFocus
            className="block box-border min-w-0 w-full rounded-[var(--r)] border-[1.5px] border-rule-em bg-canvas px-[13px] py-[11px] font-sans text-[15px] font-medium text-tp outline-none transition-colors duration-200 placeholder:text-tm focus:border-red focus:ring-2 focus:ring-red/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className={cn(
              'rounded-[var(--r)] border-none px-4 py-3 text-[14px] font-bold text-white transition-opacity duration-150 disabled:cursor-default disabled:opacity-60',
              confirmReady ? 'bg-red cursor-pointer' : 'bg-red/70 cursor-pointer'
            )}
          >
            {deleting ? 'Deleting account...' : 'Yes, permanently delete my account'}
          </button>
          <button
            type="button"
            className="rounded-[var(--r)] border border-rule bg-transparent px-4 py-3 text-[14px] font-bold text-tp cursor-pointer transition-colors duration-150 hover:border-tp disabled:cursor-default disabled:opacity-60"
            onClick={handleClose}
            disabled={deleting}
          >
            Cancel
          </button>
        </div>

        {deleteError && <p className="mt-4 text-[12px] font-medium text-red" role="alert">{deleteError}</p>}
      </div>
    </Modal>
  )
}
