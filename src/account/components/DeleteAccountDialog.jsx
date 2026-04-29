'use client'

import { useRef, useState } from 'react'
import { Button } from '@shared/components/ui/Button'
import { FieldInput } from '@shared/components/ui/Field'
import { Modal } from '@shared/components/ui/Modal'
import { cn } from '@shared/utils/cn'
import { useDeleteAccount } from '@account/hooks/useDeleteAccount'

const DEFAULT_DESCRIPTION =
  'Permanently deletes your brag doc and all associated entries, evidence files, and records from our servers.'

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
      dialogClassName="max-w-[32.5rem] border-none bg-transparent"
      labelledBy="delete-account-dialog-title"
      describedBy="delete-account-dialog-description"
    >
      <div className="mx-[-1.5rem] my-[-1.25rem] overflow-hidden rounded-xl border border-[var(--cl-dialog-border)] bg-[var(--cl-dialog-surface)] shadow-[0_32px_96px_var(--cl-dialog-shadow)]">
        <div className="flex items-start gap-4 bg-[var(--cl-dialog-ink)] px-8 pb-5 pt-6 max-sm:px-5">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--cl-dialog-red-border)] bg-[var(--cl-dialog-red-soft)] text-[var(--cl-dialog-accent)]" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <div>
            <div className="text-[17px] font-medium leading-tight text-[var(--cl-dialog-surface)]" id="delete-account-dialog-title">Delete your account?</div>
            <div className="mt-1 text-[13px] leading-6 text-[var(--cl-white-82)]" id="delete-account-dialog-description">
              This action is permanent and cannot be undone.
            </div>
          </div>
        </div>

        <div className="border-b border-[var(--cl-dialog-border-2)] px-8 py-6 max-sm:px-5">
          <p className="m-0 text-[14px] leading-[1.65] text-[var(--cl-dialog-ink-2)]">{description}</p>
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-[var(--cl-dialog-red-border-2)] bg-[var(--cl-dialog-red-soft-2)] px-3.5 py-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-px h-3.5 w-3.5 shrink-0 text-[var(--cl-dialog-warning)]" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="m-0 text-[12px] leading-[1.5] text-[var(--cl-dialog-warning-2)]">You will lose all your data immediately. There is no recovery option.</p>
          </div>
        </div>

        <div className="px-8 py-6 max-sm:px-5">
          <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--cl-dialog-ink-3)]" htmlFor="delete-confirm-input">
            Type DELETE to confirm
          </label>
          <FieldInput
            id="delete-confirm-input"
            ref={inputRef}
            type="text"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="DELETE"
            autoComplete="off"
            autoFocus
            className="block box-border min-w-0 w-full rounded-lg border border-[var(--cl-dialog-border-3)] bg-[var(--cl-dialog-surface-2)] px-3.5 py-[11px] font-mono text-[14px] tracking-[0.05em] text-[var(--cl-dialog-ink)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--cl-dialog-ink-3-70)] focus:border-[var(--cl-dialog-warning-2)] focus:ring-2 focus:ring-[var(--cl-dialog-warning-2-25)]"
          />
        </div>

        {deleteError && <p className="mx-8 mb-4 mt-[-0.5rem] rounded-lg border border-[var(--cl-dialog-red-border-2)] bg-[var(--cl-dialog-red-soft-2)] px-3.5 py-3 text-[12px] font-medium text-[var(--cl-dialog-warning-2)] max-sm:mx-5" role="alert">{deleteError}</p>}

        <div className="flex gap-2.5 px-8 pb-7 max-sm:flex-col-reverse max-sm:px-5">
          <Button
            type="button"
            className="flex-1 rounded-lg border border-[var(--cl-dialog-border-4)] bg-transparent px-4 py-[11px] text-[14px] font-medium text-[var(--cl-dialog-ink-2)] transition-colors duration-150 hover:border-[var(--cl-dialog-ink-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-dialog-ink-2)] disabled:cursor-default"
            onClick={handleClose}
            disabled={deleting}
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!confirmReady || deleting}
            className={cn(
              'flex-1 rounded-lg border px-4 py-[11px] text-[14px] font-medium transition-[background,border-color,color] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-dialog-warning-2)] disabled:cursor-not-allowed',
              confirmReady ? 'border-[var(--cl-dialog-warning)] bg-[var(--cl-dialog-warning)] text-[var(--cl-dialog-surface)]' : 'border-[var(--cl-dialog-border-2)] bg-[var(--cl-dialog-muted-2)] text-[var(--cl-dialog-muted)]'
            )}
            variant="ghost"
          >
            {deleting ? 'Deleting account...' : 'Delete account'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
