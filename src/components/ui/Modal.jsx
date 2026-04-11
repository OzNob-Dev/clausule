import { useEffect } from 'react'

export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card dark:bg-card-dark rounded-lg w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.09)]">
            <h3 className="text-[15px] font-medium text-tp dark:text-tp-dark">{title}</h3>
            <button
              onClick={onClose}
              className="text-tm hover:text-ts transition-colors w-7 h-7 flex items-center justify-center rounded"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
              </svg>
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 pb-5 flex gap-2 justify-end">{footer}</div>
        )}
      </div>
    </div>
  )
}
