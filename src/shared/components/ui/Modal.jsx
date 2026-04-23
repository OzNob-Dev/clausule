import { useEffect } from 'react'

export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose} role="presentation">
      <div className="w-full max-w-[28rem] rounded-[var(--r2)] border border-rule-em bg-card" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between border-b border-rule px-6 py-4">
            <h3 className="text-[15px] font-bold text-tp">{title}</h3>
            <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-[var(--r)] border-none bg-transparent text-tm cursor-pointer transition-colors duration-150 hover:text-ts" aria-label="Close modal">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
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
