'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '@shared/components/ui/Button'
import { Modal } from '@shared/components/ui/Modal'
import { useDeleteAccount } from '@account/hooks/useDeleteAccount'
import { ShieldIcon } from '@shared/components/ui/icon/ShieldIcon'
import { AlertIcon } from '@shared/components/ui/icon/AlertIcon'

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
      <div className="delete-account-dialog mx-auto w-full max-w-[520px] overflow-hidden rounded-2xl bg-[var(--cl-dialog-delete-surface)]">
        <div className="delete-account-dialog__head relative flex min-h-[110px] items-center gap-5 overflow-hidden bg-[#1A0808] px-7 pb-[26px] pt-6 max-[560px]:px-5">
          <canvas ref={headCanvasRef} className="delete-account-dialog__canvas absolute inset-0 h-full w-full pointer-events-none" aria-hidden="true" />
          <div className="delete-account-dialog__head-content relative z-[2] flex items-center gap-5 max-[560px]:gap-4">
            <div className="delete-account-dialog__icon-wrap relative flex h-[52px] w-[52px] shrink-0 items-center justify-center max-[560px]:h-[46px] max-[560px]:w-[46px]" aria-hidden="true">
              <ShieldIcon size={52} className="max-[560px]:h-[46px] max-[560px]:w-[46px]" />
            </div>

            <div className="delete-account-dialog__head-text relative z-[2] flex-1">
              <h2 className="delete-account-dialog__title mb-[5px] text-[var(--cl-title-lg)] font-normal leading-[1.1] tracking-[-0.4px] text-[#FFE8E8] [font-family:var(--cl-font-editorial)]" id={titleId}>Delete your account?</h2>
              <p className="delete-account-dialog__subtitle text-[var(--cl-text-md)] leading-[1.45] text-[#C09090]" id={subtitleId}>This action is permanent and cannot be undone.</p>
            </div>
          </div>
        </div>

        <div className="delete-account-dialog__body px-7 pb-6 pt-7 max-[560px]:px-5">
          <p className="delete-account-dialog__copy mb-[18px] text-[var(--cl-text-base)] leading-[1.7] text-[#3D2F22]">{description}</p>

          <div className="delete-account-dialog__warning mb-6 flex items-start gap-3 rounded-lg border border-[rgba(176,48,48,0.2)] border-l-[3px] border-l-[#B83232] bg-[#FEF0EE] px-4 py-[14px]" role="alert">
            <span className="delete-account-dialog__warning-icon mt-px shrink-0" aria-hidden="true">
              <AlertIcon size={16} className="stroke-[#B83232] [stroke-linecap:round] [stroke-linejoin:round]" />
            </span>
            <span className="delete-account-dialog__warning-text text-[var(--cl-text-md)] font-bold leading-[1.45] text-[#8B2020]">You will lose all your data immediately. There is no recovery option.</span>
          </div>

          <div className="delete-account-dialog__confirm confirm-section">
            <span className="delete-account-dialog__label confirm-label mb-3 block text-[var(--cl-text-xs)] font-bold uppercase leading-[1.2] tracking-[2px] text-[#4A3828]">Confirmation required</span>
            <div className="delete-account-dialog__input-wrap confirm-input-wrap relative rounded-[10px] border-[1.5px] border-[rgba(176,48,48,0.35)] bg-[#1A0808] px-5 py-4 focus-within:border-[#B83232] focus-within:shadow-[0_0_0_3px_rgba(176,48,48,0.15),inset_0_0_40px_rgba(180,30,10,0.2)]">
              <span className="delete-account-dialog__input-label-inner confirm-input-label-inner mb-1.5 block text-[var(--cl-text-2xs)] font-bold uppercase leading-[1.2] tracking-[2px] text-[#F0A090]" aria-hidden="true">Type DELETE to confirm</span>
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
                className="delete-account-dialog__input confirm-input block w-full border-0 bg-transparent p-0 text-[var(--cl-display-sm)] font-normal leading-[1.1] tracking-[6px] text-[#FFE8E8] outline-none [font-family:var(--cl-font-editorial)] placeholder:text-[rgba(255,160,130,0.6)]"
                aria-label="Type DELETE to confirm"
                aria-describedby={confirmDescId}
              />
              <div className="delete-account-dialog__input-underline confirm-input-underline relative mt-2.5 h-[1.5px] overflow-hidden rounded-[1px] bg-[rgba(176,48,48,0.25)]" aria-hidden="true">
                <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,transparent,rgba(255,80,40,0.7),transparent)] opacity-60" />
              </div>
            </div>
            <p className="delete-account-dialog__hint confirm-input-hint mt-2 text-[var(--cl-text-xs)] leading-[1.45] tracking-[0.3px] text-[#C08888]" aria-hidden="true">Type DELETE in capitals - this cannot be undone</p>
            <span id={confirmDescId} className="sr-only">Type the word DELETE in capital letters to enable the delete button</span>
          </div>

          <div className="delete-account-dialog__rule my-6 h-[0.5px] bg-[rgba(28,26,23,0.1)]" />

          {deleteError ? <p className="delete-account-dialog__error mb-4 rounded-lg border border-[rgba(180,60,40,0.22)] bg-[rgba(180,60,40,0.08)] px-4 py-[14px] text-[var(--cl-text-sm)] font-bold leading-[1.45] text-[#7A1F12]" role="alert">{deleteError}</p> : null}

          <div className="delete-account-dialog__actions flex gap-3 max-[560px]:flex-col-reverse">
            <Button type="button" variant="ghost" className="delete-account-dialog__cancel flex-1 justify-center rounded-lg border-[1.5px] border-[rgba(28,26,23,0.15)] bg-transparent px-[13px] py-[13px] text-[var(--cl-text-md)] font-bold leading-[1.2] text-[#5C4E42] shadow-none transition-[background,border-color,color,opacity] duration-150 hover:bg-[#EAE4DA] hover:opacity-100 hover:translate-y-0" onClick={handleClose} disabled={deleting}>
              Cancel
            </Button>
            <Button
              type="button"
              className={`delete-account-dialog__delete flex-1 justify-center rounded-lg border-0 px-[13px] py-[13px] text-[var(--cl-text-md)] font-bold leading-[1.2] text-[#F5E8E8] shadow-none transition-[background,border-color,color,opacity] duration-150 hover:translate-y-0 ${confirmReady ? 'is-ready bg-[#8B2020] opacity-100 hover:bg-[#6E1818]' : 'bg-[#8B2020] opacity-40'}`}
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
