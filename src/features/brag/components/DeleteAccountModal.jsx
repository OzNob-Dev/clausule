'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@features/auth/context/AuthContext'

export default function DeleteAccountModal({ open, onClose }) {
  const { logout } = useAuth()
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [visible, setVisible] = useState(false)
  const inputRef = useRef(null)
  const frameRef = useRef(null)

  useEffect(() => {
    if (open) {
      frameRef.current = requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
      setDeleteConfirm('')
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [open])

  const confirmReady = deleteConfirm === 'DELETE'

  const handleConfirm = () => {
    if (!confirmReady) {
      const el = inputRef.current
      if (el) {
        el.classList.remove('bss-confirm-input--shake')
        void el.offsetWidth
        el.classList.add('bss-confirm-input--shake')
      }
      return
    }
    logout()
  }

  const handleClose = () => {
    onClose()
  }

  if (!open && !visible) return null

  return (
    <div
      className={`bss-overlay${visible ? ' bss-overlay--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`bss-modal${visible ? ' bss-modal--open' : ''}`}>
        <div className="bss-modal-icon-wrap" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" stroke="#B83232" strokeWidth="1.8" strokeLinecap="round">
            <polyline points="3 6 5 6 17 6"/>
            <path d="M8 6V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/>
            <path d="M16 6l-1 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/>
            <line x1="10" y1="11" x2="10" y2="15"/>
            <line x1="8"  y1="11" x2="8"  y2="15"/>
            <line x1="12" y1="11" x2="12" y2="15"/>
          </svg>
        </div>
        <div className="bss-modal-title" id="delete-modal-title">Delete your account?</div>
        <div className="bss-modal-body">
          This will <strong>permanently delete</strong> your brag doc and all associated entries, evidence files, and records from our servers. This action <strong>cannot be undone</strong>.
        </div>
        <div className="bss-modal-confirm-wrap">
          <label className="bss-confirm-label" htmlFor="delete-confirm-input">
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
            className="bss-confirm-input"
          />
        </div>
        <div className="bss-modal-actions">
          <button
            onClick={handleConfirm}
            className={`bss-btn-delete-confirm${confirmReady ? ' bss-btn-delete-confirm--ready' : ''}`}
          >
            Yes, permanently delete my account
          </button>
          <button className="bss-btn-modal-cancel" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
