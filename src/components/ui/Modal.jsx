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
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--rule-em)',
          borderRadius: 'var(--r2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--rule)' }}
          >
            <h3 className="text-[15px] font-bold" style={{ color: 'var(--tp)' }}>{title}</h3>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-clausule transition-colors"
              style={{ color: 'var(--tm)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--ts)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--tm)'}
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
