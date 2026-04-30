import './Icon.css'

export function CopyIcon({ copied}) {
  return copied ? (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M2 7l3.5 3.5L12 3" />
    </svg>
  ) : (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="4" y="4" width="8" height="8" rx="1" />
      <path d="M2 10V3a1 1 0 0 1 1-1h7" />
    </svg>
  )
}
