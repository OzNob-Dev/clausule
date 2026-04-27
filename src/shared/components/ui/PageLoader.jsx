'use client'

import '@shared/styles/page-loader.css'

/* ── Per-variant animation components ─────────────────────────── */

function SignupAnim() {
  return (
    <svg className="pl-signup" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      {/* rotate-90 starts drawing from 12 o'clock */}
      <g transform="rotate(-90 48 48)">
        <circle
          className="pl-r1"
          cx="48" cy="48" r="44"
          stroke="#C94F2A" strokeWidth="3" strokeLinecap="round"
          strokeDasharray="276.5"
        />
        <circle
          className="pl-r2"
          cx="48" cy="48" r="30"
          stroke="#B9824F" strokeWidth="3" strokeLinecap="round"
          strokeDasharray="188.5"
        />
        <circle
          className="pl-r3"
          cx="48" cy="48" r="16"
          stroke="#225F3D" strokeWidth="3" strokeLinecap="round"
          strokeDasharray="100.5"
        />
      </g>
    </svg>
  )
}

function AuthAnim() {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      {/* Faint track ring */}
      <circle cx="48" cy="48" r="40" stroke="rgba(201,79,42,0.12)" strokeWidth="4" />
      {/* Breathing arc */}
      <circle
        className="pl-signin-arc"
        cx="48" cy="48" r="40"
        stroke="#C94F2A" strokeWidth="4" strokeLinecap="round"
        strokeDasharray="251"
        transform="rotate(-90 48 48)"
      />
      {/* Halo behind dot */}
      <circle className="pl-signin-halo" cx="48" cy="48" r="16" fill="rgba(201,79,42,0.18)" />
      {/* Pulsing centre dot */}
      <circle className="pl-signin-dot" cx="48" cy="48" r="6" fill="#C94F2A" />
    </svg>
  )
}

function BragAnim() {
  return (
    <div className="pl-brag-lines" aria-hidden="true">
      <div className="pl-brag-line pl-bl1" />
      <div className="pl-brag-line pl-bl2" />
      <div className="pl-brag-line pl-bl3" />
      <div className="pl-brag-line pl-bl4" />
      <div className="pl-brag-line pl-bl5" />
    </div>
  )
}

function FeedbackAnim() {
  return (
    <div className="pl-feedback-dots" aria-hidden="true">
      <div className="pl-dot pl-fd1" />
      <div className="pl-dot pl-fd2" />
      <div className="pl-dot pl-fd3" />
    </div>
  )
}

function SettingsAnim() {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      {/*
        Outer gear: Feather settings path originally at 24×24, doubled to 48×48
        in the mockup, then re-centred to 96×96 via translate(48,48) scale(2) translate(-24,-24).
        The wrapper <g> carries the CSS rotation at transform-origin 48,48.
      */}
      <g className="pl-gear-outer">
        <g transform="translate(48 48) scale(2) translate(-24 -24)">
          <path
            d="M24 8a2 2 0 012 2v1.5a12.5 12.5 0 013.46 1.43l1.06-1.06a2 2 0 012.83 0
               l1.78 1.78a2 2 0 010 2.83l-1.06 1.06A12.5 12.5 0 0135.5 20H37a2 2 0 012 2v2
               a2 2 0 01-2 2h-1.5a12.5 12.5 0 01-1.43 3.46l1.06 1.06a2 2 0 010 2.83
               l-1.78 1.78a2 2 0 01-2.83 0l-1.06-1.06A12.5 12.5 0 0126 35.5V37a2 2 0 01-2 2
               a2 2 0 01-2-2v-1.5a12.5 12.5 0 01-3.46-1.43l-1.06 1.06a2 2 0 01-2.83 0
               l-1.78-1.78a2 2 0 010-2.83l1.06-1.06A12.5 12.5 0 0112.5 26H11a2 2 0 01-2-2v-2
               a2 2 0 012-2h1.5a12.5 12.5 0 011.43-3.46l-1.06-1.06a2 2 0 010-2.83
               l1.78-1.78a2 2 0 012.83 0l1.06 1.06A12.5 12.5 0 0122 11.5V10a2 2 0 012-2z"
            stroke="#C94F2A"
            strokeWidth="1"
            fill="none"
          />
        </g>
      </g>
      {/* Inner counter-rotating ring */}
      <g className="pl-gear-inner">
        <circle cx="48" cy="48" r="14" stroke="#225F3D" strokeWidth="2" />
      </g>
    </svg>
  )
}

function ProfileAnim() {
  return (
    <div className="pl-profile-ring" aria-hidden="true">
      <div className="pl-profile-face">
        <div className="pl-profile-shimmer" />
      </div>
    </div>
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
  signup:   { label: 'Setting things up',     Anim: SignupAnim   },
  auth:     { label: 'Signing in',            Anim: AuthAnim     },
  brag:     { label: 'Loading your brag doc', Anim: BragAnim     },
  feedback: { label: 'Loading feedback',      Anim: FeedbackAnim },
  settings: { label: 'Loading settings',      Anim: SettingsAnim },
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
