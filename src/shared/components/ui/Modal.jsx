import { useEffect, useRef, useId } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, title, children, footer }) {
  const dialogRef  = useRef(null)
  const triggerRef = useRef(null)
  const titleId    = useId()

  // Capture trigger element and move focus into dialog on open;
  // restore focus to trigger on close.
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
      const first = dialogRef.current?.querySelector(FOCUSABLE_SELECTOR)
      first?.focus()
    } else if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [open])

  // Trap focus within dialog and handle Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const focusable = Array.from(dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [])
      if (!focusable.length) return
      const first = focusable[0]
      const last  = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="w-full max-w-[28rem] rounded-[var(--r2)] border border-rule-em bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-rule px-6 py-4">
            <h3 id={titleId} className="text-[15px] font-bold text-tp">{title}</h3>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-[var(--r)] border-none bg-transparent text-tm cursor-pointer transition-colors duration-150 hover:text-ts"
              aria-label="Close modal"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
              </svg>
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 px-6 pb-5">{footer}</div>
        )}
      </div>
    </div>
  )
}
