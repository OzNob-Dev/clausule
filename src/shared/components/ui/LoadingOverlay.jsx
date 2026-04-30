'use client'

import { useEffect, useRef } from 'react'

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
  label = 'Loading app',
  eyebrow = 'Please wait',
  heading = 'Just a moment.',
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
      <div className="loader-copy">
        <p className="loader-eyebrow">{eyebrow}</p>
        <h2 className="loader-heading">Just a<br /><em>moment.</em></h2>
        <div className="loader-rule" />
        <p className="loader-sub">{sub}</p>
        <div className="loader-dots" aria-hidden="true">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>
      <style>{`
        .loading-overlay {
          position: absolute;
          inset: 0;
          overflow: hidden;
          display: grid;
          place-items: center;
          padding: clamp(24px, 4vw, 52px);
          background: linear-gradient(165deg, #F7F3EE 0%, #EDE6DA 100%);
        }
        .loader-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        .loader-copy {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          text-align: center;
          pointer-events: none;
        }
        .loader-eyebrow {
          font-size: 10px;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          color: rgba(196, 107, 74, 0.6);
          font-weight: 700;
          animation: ew-breathe 2.8s ease-in-out infinite;
        }
        .loader-heading {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(34px, 5vw, 42px);
          line-height: 1.08;
          letter-spacing: -1.2px;
          color: #1C1A17;
          animation: heading-drift 0.8s cubic-bezier(.22, 1, .36, 1) 0.1s both;
        }
        .loader-heading em {
          font-style: italic;
          color: #C46B4A;
          display: inline-block;
          animation: italic-glow 3s ease-in-out 1s infinite;
        }
        .loader-rule {
          width: 0;
          height: 1px;
          background: rgba(196, 107, 74, 0.4);
          animation: draw-rule 1s cubic-bezier(.22, 1, .36, 1) 0.5s forwards;
        }
        .loader-sub {
          font-size: 13px;
          color: #8B7B6B;
          letter-spacing: 0.2px;
          line-height: 1.5;
          animation: heading-drift 0.6s cubic-bezier(.22, 1, .36, 1) 0.7s both;
        }
        .loader-dots {
          display: flex;
          gap: 10px;
          animation: heading-drift 0.5s ease 0.9s both;
        }
        .dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #C46B4A;
          animation: dot-rise 1.6s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.25s; }
        .dot:nth-child(3) { animation-delay: 0.5s; }
        @keyframes ew-breathe {
          0%, 100% { opacity: 0.4; letter-spacing: 3.5px; }
          50% { opacity: 0.85; letter-spacing: 4.5px; }
        }
        @keyframes heading-drift {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes italic-glow {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }
        @keyframes draw-rule {
          to { width: 48px; }
        }
        @keyframes dot-rise {
          0%, 100% { transform: translateY(0); opacity: 0.25; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .loader-eyebrow,
          .loader-heading,
          .loader-heading em,
          .loader-rule,
          .loader-sub,
          .loader-dots,
          .dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
