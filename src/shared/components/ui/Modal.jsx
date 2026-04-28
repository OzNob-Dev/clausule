'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@shared/utils/cn'

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  dialogClassName = '',
  ariaLabel,
  labelledBy,
  describedBy,
}) {
  const dialogRef = useRef(null)
  const triggerRef = useRef(null)
  const titleId = useId()
  const [portalNode, setPortalNode] = useState(null)
  const resolvedLabelledBy = ariaLabel ? undefined : labelledBy ?? (title ? titleId : undefined)

  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    const node = document.createElement('div')
    node.dataset.modalRoot = 'true'
    document.body.appendChild(node)
    setPortalNode(node)
    return () => {
      node.remove()
      setPortalNode(null)
    }
  }, [])

  // Capture trigger element and move focus into dialog on open;
  // restore focus to trigger on close.
  useEffect(() => {
    if (!portalNode) return undefined
    if (open) {
      triggerRef.current = document.activeElement
      const focusTimer = window.setTimeout(() => {
        if (dialogRef.current?.contains(document.activeElement)) return
        const focusable = Array.from(dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [])
        const first = focusable.find((node) => node.autofocus) ?? focusable[0]
        first?.focus()
      }, 0)
      return () => window.clearTimeout(focusTimer)
    } else if (triggerRef.current instanceof HTMLElement) {
      const focusTarget = triggerRef.current
      triggerRef.current = null
      const id = window.setTimeout(() => focusTarget.focus(), 0)
      return () => window.clearTimeout(id)
    }
  }, [open, portalNode])

  // Trap focus within dialog, inert the background, and handle Escape.
  useEffect(() => {
    if (!open || !portalNode) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const siblings = Array.from(document.body.children).filter((node) => node !== portalNode)
    const siblingState = siblings.map((node) => ({
      node,
      ariaHidden: node.getAttribute('aria-hidden'),
      hadInert: node.hasAttribute('inert'),
    }))

    siblings.forEach((node) => {
      node.setAttribute('aria-hidden', 'true')
      node.setAttribute('inert', '')
    })

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
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      siblingState.forEach(({ node, ariaHidden, hadInert }) => {
        if (ariaHidden === null) node.removeAttribute('aria-hidden')
        else node.setAttribute('aria-hidden', ariaHidden)
        if (!hadInert) node.removeAttribute('inert')
      })
    }
  }, [open, onClose, portalNode])

  if (!open || !portalNode) {
    console.log('[Modal] bailing — open:', open, 'portalNode:', portalNode)
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={resolvedLabelledBy}
        aria-describedby={describedBy}
        className={cn('w-full max-w-[28rem] rounded-[var(--r2)] border border-rule-em bg-card', dialogClassName)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-rule px-6 py-4">
            <h3 id={titleId} className="text-[15px] font-bold text-tp">{title}</h3>
            <button
              type="button"
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
    ,
    portalNode
  )
}
