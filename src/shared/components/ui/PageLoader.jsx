'use client'

import '@shared/styles/page-loader.css'

/* ── Per-variant animation components ─────────────────────────── */

function SignupAnim() {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <g className="pl-blob-outer">
        <path
          className="pl-blob-path"
          fill="var(--cl-accent-strong)"
          fillOpacity="0.12"
          stroke="var(--cl-accent-strong)"
          strokeWidth="1.5"
          d="M48,10 C65,10 86,25 86,48 C86,71 65,86 48,86 C31,86 10,71 10,48 C10,25 31,10 48,10 Z"
        />
      </g>
      <g className="pl-blob-inner">
        <path
          d="M48,28 C56,28 66,36 66,48 C66,60 56,68 48,68 C40,68 30,60 30,48 C30,36 40,28 48,28 Z"
          fill="var(--cl-green)"
          fillOpacity="0.12"
          stroke="var(--cl-green)"
          strokeWidth="1.5"
        />
      </g>
      <g className="pl-blob-orbit pl-blob-orbit-1"><circle cx="48" cy="48" r="4.5" fill="var(--cl-accent-strong)" /></g>
      <g className="pl-blob-orbit pl-blob-orbit-2"><circle cx="48" cy="48" r="3.5" fill="var(--cl-ring-mid)" /></g>
      <g className="pl-blob-orbit pl-blob-orbit-3"><circle cx="48" cy="48" r="3" fill="var(--cl-green)" /></g>
      <circle cx="48" cy="48" r="5" fill="var(--cl-accent-strong)" opacity="0.9" />
    </svg>
  )
}

function AuthAnim() {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="38" stroke="var(--cl-accent-strong)" strokeOpacity="0.15" strokeWidth="1" />
      <circle cx="48" cy="48" r="24" stroke="var(--cl-accent-strong)" strokeOpacity="0.12" strokeWidth="1" />
      <circle cx="48" cy="48" r="10" stroke="var(--cl-accent-strong)" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="48" y1="48" x2="48" y2="12" stroke="var(--cl-accent-strong)" strokeOpacity="0.2" strokeWidth="0.5" />
      <line x1="48" y1="48" x2="82" y2="48" stroke="var(--cl-accent-strong)" strokeOpacity="0.2" strokeWidth="0.5" />
      <line x1="48" y1="48" x2="48" y2="84" stroke="var(--cl-accent-strong)" strokeOpacity="0.2" strokeWidth="0.5" />
      <line x1="48" y1="48" x2="14" y2="48" stroke="var(--cl-accent-strong)" strokeOpacity="0.2" strokeWidth="0.5" />
      <circle className="pl-radar-ping pl-radar-ping-1" cx="62" cy="30" r="0" fill="none" stroke="var(--cl-accent-strong)" strokeWidth="1.5" />
      <circle className="pl-radar-ping pl-radar-ping-2" cx="62" cy="30" r="0" fill="none" stroke="var(--cl-accent-strong)" strokeWidth="1" />
      <circle className="pl-radar-blip" cx="62" cy="30" r="3.5" fill="var(--cl-accent-strong)" />
      <g className="pl-radar-sweep">
        <path d="M48 48 L86 48 A38 38 0 0 0 48 10 Z" fill="url(#pl-radar-sweep-grad)" />
        <defs>
          <radialGradient id="pl-radar-sweep-grad" cx="0" cy="50%" r="100%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="var(--cl-accent-strong)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--cl-accent-strong)" stopOpacity="0" />
          </radialGradient>
        </defs>
      </g>
      <circle cx="48" cy="48" r="3" fill="var(--cl-accent-strong)" />
    </svg>
  )
}

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

function FeedbackAnim() {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle className="pl-ink-dot pl-ink-dot-1" cx="22" cy="58" r="8" fill="var(--cl-accent-strong)" />
      <circle className="pl-ink-dot pl-ink-dot-2" cx="38" cy="32" r="11" fill="var(--cl-green)" />
      <circle className="pl-ink-dot pl-ink-dot-3" cx="60" cy="55" r="9" fill="var(--cl-ring-mid)" />
      <circle className="pl-ink-dot pl-ink-dot-4" cx="74" cy="30" r="7" fill="var(--cl-accent-strong)" />
      <circle className="pl-ink-ring" cx="38" cy="32" fill="none" stroke="var(--cl-green)" r="6" />
    </svg>
  )
}

function SettingsAnim() {
  return (
    <svg className="pl-helix-svg" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <clipPath id="pl-helix-clip"><rect x="20" y="10" width="56" height="76" /></clipPath>
      <g clipPath="url(#pl-helix-clip)">
        <g className="pl-helix-g">
          <path
            d="M30,4 C38,0 58,8 66,12 C74,16 74,24 66,28 C58,32 38,40 30,44 C22,48 22,56 30,60 C38,64 58,72 66,76 C74,80 74,88 66,92 C58,96 38,104 30,108"
            stroke="var(--cl-accent-strong)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M66,4 C58,0 38,8 30,12 C22,16 22,24 30,28 C38,32 58,40 66,44 C74,48 74,56 66,60 C58,64 38,72 30,76 C22,80 22,88 30,92 C38,96 58,104 66,108"
            stroke="var(--cl-green)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <line x1="30" y1="12" x2="66" y2="12" stroke="var(--cl-ring-mid)" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7" />
          <line x1="30" y1="28" x2="66" y2="28" stroke="var(--cl-ring-mid)" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7" />
          <line x1="30" y1="44" x2="66" y2="44" stroke="var(--cl-ring-mid)" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.9" />
          <line x1="30" y1="60" x2="66" y2="60" stroke="var(--cl-ring-mid)" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7" />
          <line x1="30" y1="76" x2="66" y2="76" stroke="var(--cl-ring-mid)" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.9" />
          <line x1="30" y1="92" x2="66" y2="92" stroke="var(--cl-ring-mid)" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7" />
          <circle cx="30" cy="12" r="4" fill="var(--cl-accent-strong)" />
          <circle cx="66" cy="12" r="4" fill="var(--cl-green)" />
          <circle cx="66" cy="28" r="4" fill="var(--cl-accent-strong)" />
          <circle cx="30" cy="28" r="4" fill="var(--cl-green)" />
          <circle cx="30" cy="44" r="4" fill="var(--cl-accent-strong)" />
          <circle cx="66" cy="44" r="4" fill="var(--cl-green)" />
          <circle cx="66" cy="60" r="4" fill="var(--cl-accent-strong)" />
          <circle cx="30" cy="60" r="4" fill="var(--cl-green)" />
          <circle cx="30" cy="76" r="4" fill="var(--cl-accent-strong)" />
          <circle cx="66" cy="76" r="4" fill="var(--cl-green)" />
          <circle cx="66" cy="92" r="4" fill="var(--cl-accent-strong)" />
          <circle cx="30" cy="92" r="4" fill="var(--cl-green)" />
        </g>
      </g>
    </svg>
  )
}

function ProfileAnim() {
  return (
    <svg className="pl-profile-svg" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <clipPath id="pl-film-clip"><rect x="8" y="20" width="80" height="56" rx="4" /></clipPath>
      <rect x="8" y="20" width="80" height="56" rx="4" fill="var(--cl-accent-strong)" fillOpacity="0.06" stroke="var(--cl-accent-strong)" strokeWidth="1.5" />
      <rect x="12" y="22" width="7" height="5" rx="1.5" fill="var(--cl-accent-strong)" opacity="0.5" />
      <rect x="26" y="22" width="7" height="5" rx="1.5" fill="var(--cl-accent-strong)" opacity="0.5" />
      <rect x="40" y="22" width="7" height="5" rx="1.5" fill="var(--cl-accent-strong)" opacity="0.5" />
      <rect x="54" y="22" width="7" height="5" rx="1.5" fill="var(--cl-accent-strong)" opacity="0.5" />
      <rect x="68" y="22" width="7" height="5" rx="1.5" fill="var(--cl-accent-strong)" opacity="0.5" />
      <rect x="77" y="22" width="7" height="5" rx="1.5" fill="var(--cl-accent-strong)" opacity="0.5" />
      <rect x="12" y="69" width="7" height="5" rx="1.5" fill="var(--cl-accent-strong)" opacity="0.5" />
      <rect x="26" y="69" width="7" height="5" rx="1.5" fill="var(--cl-accent-strong)" opacity="0.5" />
      <rect x="40" y="69" width="7" height="5" rx="1.5" fill="var(--cl-accent-strong)" opacity="0.5" />
      <rect x="54" y="69" width="7" height="5" rx="1.5" fill="var(--cl-accent-strong)" opacity="0.5" />
      <rect x="68" y="69" width="7" height="5" rx="1.5" fill="var(--cl-accent-strong)" opacity="0.5" />
      <rect x="77" y="69" width="7" height="5" rx="1.5" fill="var(--cl-accent-strong)" opacity="0.5" />
      <g clipPath="url(#pl-film-clip)">
        <g className="pl-strip-track">
          <rect x="14" y="30" width="30" height="36" rx="2" fill="var(--cl-accent-strong)" fillOpacity="0.08" stroke="var(--cl-accent-strong)" strokeOpacity="0.2" strokeWidth="0.5" />
          <circle cx="29" cy="40" r="7" fill="var(--cl-accent-strong)" fillOpacity="0.25" />
          <rect x="20" y="50" width="18" height="13" rx="4" fill="var(--cl-accent-strong)" fillOpacity="0.18" />
          <rect x="52" y="30" width="30" height="36" rx="2" fill="var(--cl-green)" fillOpacity="0.08" stroke="var(--cl-green)" strokeOpacity="0.2" strokeWidth="0.5" />
          <circle cx="67" cy="40" r="7" fill="var(--cl-green)" fillOpacity="0.25" />
          <rect x="58" y="50" width="18" height="13" rx="4" fill="var(--cl-green)" fillOpacity="0.18" />
          <rect x="90" y="30" width="30" height="36" rx="2" fill="var(--cl-ring-mid)" fillOpacity="0.08" stroke="var(--cl-ring-mid)" strokeOpacity="0.2" strokeWidth="0.5" />
          <circle cx="105" cy="40" r="7" fill="var(--cl-ring-mid)" fillOpacity="0.25" />
          <rect x="96" y="50" width="18" height="13" rx="4" fill="var(--cl-ring-mid)" fillOpacity="0.18" />
          <rect x="128" y="30" width="30" height="36" rx="2" fill="var(--cl-accent-strong)" fillOpacity="0.08" stroke="var(--cl-accent-strong)" strokeOpacity="0.2" strokeWidth="0.5" />
          <circle cx="143" cy="40" r="7" fill="var(--cl-accent-strong)" fillOpacity="0.25" />
          <rect x="134" y="50" width="18" height="13" rx="4" fill="var(--cl-accent-strong)" fillOpacity="0.18" />
        </g>
      </g>
      <rect className="pl-flash-overlay" x="8" y="20" width="80" height="56" rx="4" fill="var(--cl-white-35)" />
    </svg>
  )
}

function MfaAnim() {
  return (
    <div className="pl-mfa" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

/* ── Variant registry ──────────────────────────────────────────── */

const LOADERS = {
  signup:   { label: 'Signing up',             Anim: SignupAnim   },
  auth:     { label: 'Signing in',            Anim: AuthAnim     },
  brag:     { label: 'Loading doc',           Anim: BragAnim     },
  feedback: { label: 'Sending',               Anim: FeedbackAnim },
  settings: { label: 'Saving',                Anim: SettingsAnim },
  profile:  { label: 'Loading profile',       Anim: ProfileAnim  },
  mfa:      { label: 'Loading secure setup',  Anim: MfaAnim      },
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
