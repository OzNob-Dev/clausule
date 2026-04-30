'use client'

import '@shared/styles/page-loader.css'
import { DotsIcon, FrameIcon, HelixIcon, OrbitIcon, RadarIcon, ShieldBadgeIcon } from '@shared/components/ui/icon/PageLoaderIcons'

function BragAnim() {
  return (
    <div className="pl-brag-lines" aria-hidden="true">
      <div className="pl-brag-row pl-brag-row-1"><div className="pl-brag-bar pl-brag-bar-1" /><div className="pl-brag-cursor" /></div>
      <div className="pl-brag-row pl-brag-row-2"><div className="pl-brag-bar pl-brag-bar-2" /></div>
      <div className="pl-brag-row pl-brag-row-3"><div className="pl-brag-bar pl-brag-bar-3" /></div>
      <div className="pl-brag-row pl-brag-row-4"><div className="pl-brag-bar pl-brag-bar-4" /></div>
      <div className="pl-brag-row pl-brag-row-5"><div className="pl-brag-bar pl-brag-bar-5" /></div>
    </div>
  )
}

/* ── Variant registry ──────────────────────────────────────────── */

const LOADERS = {
  signup:   { label: 'Signing up',             Anim: OrbitIcon   },
  auth:     { label: 'Signing in',             Anim: RadarIcon   },
  brag:     { label: 'Loading doc',            Anim: BragAnim    },
  feedback: { label: 'Sending',                Anim: DotsIcon    },
  settings: { label: 'Saving',                 Anim: HelixIcon   },
  profile:  { label: 'Loading profile',        Anim: FrameIcon   },
  mfa:      { label: 'Loading secure setup',   Anim: ShieldBadgeIcon },
}

/* ── Component ─────────────────────────────────────────────────── */

export default function PageLoader({ variant = 'brag' }) {
  const { label, Anim } = LOADERS[variant] ?? LOADERS.brag

  return (
    <div className="page-loader" role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className="page-loader-icon" aria-hidden="true">
        <Anim />
      </div>
      <p className="page-loader-label" aria-hidden="true">{label}</p>
    </div>
  )
}
