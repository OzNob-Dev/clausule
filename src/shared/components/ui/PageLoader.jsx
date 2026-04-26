'use client'

import '@shared/styles/page-loader.css'

const ICONS = {
  pencil: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5l-5 1 1-5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  envelope: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="m2 7 10 7 10-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),
  person: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  key: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="15.5" r="5.5" stroke="currentColor" strokeWidth="2" />
      <path d="m21 2-9.6 9.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m15.5 7.5 2 2M17 6l1.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

const VARIANTS = {
  brag:     { icon: 'pencil',   label: 'Loading your brag doc' },
  feedback: { icon: 'envelope', label: 'Loading feedback'       },
  settings: { icon: 'gear',     label: 'Loading settings'       },
  profile:  { icon: 'person',   label: 'Loading profile'        },
  auth:     { icon: 'key',      label: 'Signing in'             },
  signup:   { icon: 'spark',    label: 'Setting things up'      },
  mfa:      { icon: 'shield',   label: 'Loading secure setup'   },
}

export default function PageLoader({ variant = 'brag' }) {
  const { icon, label } = VARIANTS[variant] ?? VARIANTS.brag

  return (
    <div className="page-loader" role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className={`page-loader-icon page-loader-icon--${icon}`} aria-hidden="true">
        {ICONS[icon]}
      </div>
      <p className="page-loader-label" aria-hidden="true">{label}</p>
    </div>
  )
}
