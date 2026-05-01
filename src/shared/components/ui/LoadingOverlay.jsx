'use client'

import { useEffect, useRef } from 'react'
import './LoadingOverlay.css'

const POOLS = [
  { x: 0.22, y: 0.48, r: 0.42, phase: 0, sp: 0.003 },
  { x: 0.78, y: 0.55, r: 0.36, phase: 2.2, sp: 0.0025 },
  { x: 0.5, y: 0.28, r: 0.3, phase: 4.5, sp: 0.004 },
]

const makeDust = () => Array.from({ length: 55 }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: 0.6 + Math.random() * 1.8,
  vy: -(0.00015 + Math.random() * 0.00025),
  vx: (Math.random() - 0.5) * 0.00012,
  o: 0.025 + Math.random() * 0.06,
  ph: Math.random() * Math.PI * 2,
}))

export default function LoadingOverlay({
  label = 'Loading',
  eyebrow = 'Please wait',
  sub = 'Fetching your data',
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    if (navigator.userAgent.includes('jsdom')) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
    const dust = makeDust()
    let t = 0
    let raf = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.round(rect.width || canvas.parentElement?.clientWidth || 1))
      const h = Math.max(1, Math.round(rect.height || canvas.parentElement?.clientHeight || 1))
      const dpr = window.devicePixelRatio || 1

      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      const w = canvas.width / ((window.devicePixelRatio || 1) || 1)
      const h = canvas.height / ((window.devicePixelRatio || 1) || 1)

      ctx.clearRect(0, 0, w, h)

      POOLS.forEach((pool) => {
        const px = (pool.x + Math.sin(t * pool.sp + pool.phase) * 0.065) * w
        const py = (pool.y + Math.cos(t * pool.sp * 0.75 + pool.phase) * 0.055) * h
        const pr = (pool.r + 0.035 * Math.sin(t * pool.sp * 1.4 + pool.phase)) * Math.min(w, h)
        const pulse = 0.75 + 0.25 * Math.sin(t * pool.sp * 2 + pool.phase)
        const g = ctx.createRadialGradient(px, py, 0, px, py, pr)

        g.addColorStop(0, `rgba(196,107,74,${0.052 * pulse})`)
        g.addColorStop(0.45, `rgba(196,107,74,${0.018 * pulse})`)
        g.addColorStop(1, 'rgba(196,107,74,0)')
        ctx.beginPath()
        ctx.arc(px, py, pr, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      })

      dust.forEach((d) => {
        d.x += d.vx + Math.sin(t * 0.008 + d.ph) * 0.00008
        d.y += d.vy
        if (d.y < -0.02) {
          d.y = 1.02
          d.x = Math.random()
        }

        const pulse = 0.4 + 0.6 * Math.sin(t * 0.015 + d.ph)
        ctx.beginPath()
        ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(196,107,74,${d.o * pulse})`
        ctx.fill()
      })

      const period = 320
      const sweepProgress = (t % period) / period
      const sx = sweepProgress * (w + 200) - 100
      const sg = ctx.createLinearGradient(sx - 80, 0, sx + 80, 0)

      sg.addColorStop(0, 'rgba(255,240,220,0)')
      sg.addColorStop(0.5, `rgba(255,240,220,${0.06 * Math.sin(sweepProgress * Math.PI)})`)
      sg.addColorStop(1, 'rgba(255,240,220,0)')
      ctx.fillStyle = sg
      ctx.fillRect(sx - 80, 0, 160, h)

      const vg = ctx.createLinearGradient(0, h, 0, h * 0.3)
      vg.addColorStop(0, 'rgba(224,217,206,0.2)')
      vg.addColorStop(1, 'rgba(224,217,206,0)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, w, h)

      t += 1
      if (!reduceMotion) raf = window.requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="loading-overlay" role="status" aria-label={label}>
      <canvas ref={canvasRef} className="loader-canvas" aria-hidden="true" />
      <div className="skeleton-body" aria-hidden="true">
        <div className="skel-line-group">
          <div className="skel-line" />
          <div className="skel-line" />
          <div className="skel-line" />
        </div>
        <div className="skel-line-group">
          <div className="skel-line" />
          <div className="skel-line" />
          <div className="skel-line" />
        </div>
        <div className="skel-line-group">
          <div className="skel-line" />
          <div className="skel-line" />
        </div>
      </div>
      <div className="loader-copy">
        <p className="loader-eyebrow">{eyebrow}</p>
        <h2 className="loader-heading" aria-label="Just a moment.">Just a<br /><em>moment.</em></h2>
        <div className="loader-rule" />
        <p className="loader-sub">{sub}</p>
        <div className="loader-dots" aria-hidden="true">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>
    </div>
  )
}
