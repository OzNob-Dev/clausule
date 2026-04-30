'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '@shared/components/ui/Button'
import { Modal } from '@shared/components/ui/Modal'
import { useDeleteAccount } from '@account/hooks/useDeleteAccount'
import './DeleteAccountDialog.css'
import { ShieldIcon } from '@shared/components/ui/icon/ShieldIcon'
import { TriangleIcon } from '@shared/components/ui/icon/TriangleIcon'

const DEFAULT_DESCRIPTION =
  'This will permanently delete your brag doc and all associated entries, evidence files, and records from our servers.'

export function DeleteAccountDialog({ open, onClose, description = DEFAULT_DESCRIPTION }) {
  const confirmInputRef = useRef(null)
  const headCanvasRef = useRef(null)
  const titleId = useId()
  const subtitleId = useId()
  const confirmDescId = useId()
  const { deleteAccount, deleting } = useDeleteAccount()
  const [confirmText, setConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const confirmReady = confirmText.trim() === 'DELETE'

  useEffect(() => {
    if (!open) return undefined

    const canvas = headCanvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    const head = canvas.parentElement
    if (!ctx || !head) return undefined

    let raf = 0
    let t = 0

    const resize = () => {
      canvas.width = head.offsetWidth
      canvas.height = head.offsetHeight
    }

    resize()
    window.addEventListener('resize', resize)

    const embers = Array.from({ length: 55 }, () => ({
      x: Math.random(),
      y: 1 + Math.random() * 0.3,
      vx: (Math.random() - 0.5) * 0.004,
      vy: -(0.004 + Math.random() * 0.007),
      r: 0.8 + Math.random() * 2.8,
      life: Math.random(),
      maxLife: 0.6 + Math.random() * 0.4,
      hue: 10 + Math.random() * 25,
    }))

    const blobs = Array.from({ length: 5 }, (_, i) => ({
      cx: 0.1 + i * 0.2,
      cy: 0.5 + (Math.random() - 0.5) * 0.4,
      rx: 0.12 + Math.random() * 0.18,
      ry: 0.25 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
      speed: 0.008 + Math.random() * 0.006,
    }))

    const cracks = Array.from({ length: 6 }, (_, i) => ({
      x1: 0.05 + i * 0.17 + Math.random() * 0.08,
      y1: 1,
      x2: 0.05 + i * 0.17 + (Math.random() - 0.5) * 0.15,
      y2: 0.1 + Math.random() * 0.6,
      opacity: 0,
      targetOpacity: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.015 + Math.random() * 0.02,
    }))

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const baseGlow = ctx.createLinearGradient(0, H, 0, 0)
      baseGlow.addColorStop(0, 'rgba(200,40,10,0.55)')
      baseGlow.addColorStop(0.4, 'rgba(140,20,5,0.3)')
      baseGlow.addColorStop(1, 'rgba(80,5,5,0.05)')
      ctx.fillStyle = baseGlow
      ctx.fillRect(0, 0, W, H)

      blobs.forEach((b) => {
        const px = b.cx * W
        const py = (0.6 + Math.sin(t * b.speed * 0.7 + b.phase) * 0.2) * H
        const rx = (b.rx + Math.sin(t * b.speed + b.phase * 2) * 0.04) * W
        const ry = (b.ry * 0.35 + Math.cos(t * b.speed * 1.2) * 0.05) * H
        const g = ctx.createRadialGradient(px, py, 0, px, py, rx)
        g.addColorStop(0, 'rgba(255,120,30,0.35)')
        g.addColorStop(0.5, 'rgba(200,50,10,0.2)')
        g.addColorStop(1, 'rgba(150,20,5,0)')
        ctx.beginPath()
        ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      })

      cracks.forEach((c) => {
        c.opacity += (c.targetOpacity * (0.5 + 0.5 * Math.sin(t * c.speed + c.phase)) - c.opacity) * 0.05
        const x1 = c.x1 * W
        const y1 = c.y1 * H
        const x2 = c.x2 * W
        const y2 = c.y2 * H
        const midX = (x1 + x2) / 2 + Math.sin(t * 0.03 + c.phase) * 8
        const midY = (y1 + y2) / 2
        const crackGrad = ctx.createLinearGradient(x1, y1, x2, y2)
        crackGrad.addColorStop(0, `rgba(255,140,60,${c.opacity})`)
        crackGrad.addColorStop(0.5, `rgba(255,80,20,${c.opacity * 0.7})`)
        crackGrad.addColorStop(1, 'rgba(255,60,10,0)')

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.quadraticCurveTo(midX, midY, x2, y2)
        ctx.strokeStyle = crackGrad
        ctx.lineWidth = 1 + c.opacity * 1.5
        ctx.lineCap = 'round'
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.quadraticCurveTo(midX, midY, x2, y2)
        ctx.strokeStyle = `rgba(255,100,30,${c.opacity * 0.25})`
        ctx.lineWidth = 5 + c.opacity * 4
        ctx.stroke()
      })

      embers.forEach((e) => {
        e.x += e.vx + Math.sin(t * 0.04 + e.life * 10) * 0.001
        e.y += e.vy
        e.life += 0.008 + Math.random() * 0.004
        if (e.life > e.maxLife || e.y < -0.1) {
          e.x = Math.random()
          e.y = 1.05 + Math.random() * 0.1
          e.life = 0
          e.vx = (Math.random() - 0.5) * 0.004
          e.vy = -(0.004 + Math.random() * 0.007)
        }
        const progress = e.life / e.maxLife
        const alpha = progress < 0.2 ? progress / 0.2 : progress > 0.7 ? (1 - progress) / 0.3 : 1
        const glow = ctx.createRadialGradient(e.x * W, e.y * H, 0, e.x * W, e.y * H, e.r * 3.5)
        glow.addColorStop(0, `hsla(${e.hue},100%,75%,${alpha * 0.9})`)
        glow.addColorStop(0.4, `hsla(${e.hue},90%,55%,${alpha * 0.5})`)
        glow.addColorStop(1, 'rgba(255,100,30,0)')
        ctx.beginPath()
        ctx.arc(e.x * W, e.y * H, e.r * 3.5, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()
        ctx.beginPath()
        ctx.arc(e.x * W, e.y * H, e.r * 0.6, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(50,100%,90%,${alpha * 0.95})`
        ctx.fill()
      })

      const shimmerY = 12 + Math.sin(t * 0.025) * 4
      const shimmer = ctx.createLinearGradient(0, shimmerY - 8, 0, shimmerY + 8)
      shimmer.addColorStop(0, 'rgba(255,100,40,0)')
      shimmer.addColorStop(0.5, `rgba(255,100,40,${0.08 + 0.06 * Math.sin(t * 0.04)})`)
      shimmer.addColorStop(1, 'rgba(255,100,40,0)')
      ctx.fillStyle = shimmer
      ctx.fillRect(0, shimmerY - 8, W, 16)

      t += 1
      raf = window.requestAnimationFrame(draw)
    }

    raf = window.requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(raf)
    }
  }, [open])

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
      confirmInputRef.current?.animate?.(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }],
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
      dialogClassName="!w-full !max-w-none !rounded-none !border-0 !bg-transparent !p-0 !shadow-none"
      labelledBy={titleId}
      describedBy={subtitleId}
    >
      <div className="delete-account-dialog">
        <div className="delete-account-dialog__head">
          <canvas ref={headCanvasRef} className="delete-account-dialog__canvas" aria-hidden="true" />
          <div className="delete-account-dialog__head-content">
            <div className="delete-account-dialog__icon-wrap" aria-hidden="true">
              <ShieldIcon />
            </div>

            <div className="delete-account-dialog__head-text">
              <h2 className="delete-account-dialog__title" id={titleId}>Delete your account?</h2>
              <p className="delete-account-dialog__subtitle" id={subtitleId}>This action is permanent and cannot be undone.</p>
            </div>
          </div>
        </div>

        <div className="delete-account-dialog__body">
          <p className="delete-account-dialog__copy">{description}</p>

          <div className="delete-account-dialog__warning" role="alert">
            <span className="delete-account-dialog__warning-icon" aria-hidden="true">
              <TriangleIcon />
            </span>
            <span className="delete-account-dialog__warning-text">You will lose all your data immediately. There is no recovery option.</span>
          </div>

          <div className="delete-account-dialog__confirm confirm-section">
            <span className="delete-account-dialog__label confirm-label">Confirmation required</span>
            <div className="delete-account-dialog__input-wrap confirm-input-wrap">
              <span className="delete-account-dialog__input-label-inner confirm-input-label-inner" aria-hidden="true">Type DELETE to confirm</span>
              <input
                ref={confirmInputRef}
                id="delete-confirm-input"
                type="text"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                autoFocus
                spellCheck={false}
                className="delete-account-dialog__input confirm-input"
                aria-describedby={confirmDescId}
              />
              <div className="delete-account-dialog__input-underline confirm-input-underline" aria-hidden="true" />
            </div>
            <p className="delete-account-dialog__hint confirm-input-hint" aria-hidden="true">Type DELETE in capitals - this cannot be undone</p>
            <span id={confirmDescId} className="sr-only">Type the word DELETE in capital letters to enable the delete button</span>
          </div>

          <div className="delete-account-dialog__rule" />

          {deleteError && <p className="delete-account-dialog__error" role="alert">{deleteError}</p>}

          <div className="delete-account-dialog__actions">
            <Button type="button" variant="ghost" className="delete-account-dialog__cancel" onClick={handleClose} disabled={deleting}>
              Cancel
            </Button>
            <Button
              type="button"
              className={`delete-account-dialog__delete${confirmReady ? ' is-ready' : ''}`}
              onClick={handleConfirm}
              disabled={!confirmReady || deleting}
              aria-disabled={!confirmReady || deleting}
              variant="ghost"
            >
              {deleting ? 'Deleting account...' : 'Delete account'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
