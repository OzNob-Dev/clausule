export function CheckIcon({ dark = false }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={dark ? '#1A1510' : '#F5F0EA'} strokeWidth="1.8" aria-hidden="true">
      <polyline points="2 5 4 7 8 3" />
    </svg>
  )
}

export function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <line x1="3" y1="8" x2="13" y2="8" />
      <polyline points="9 4 13 8 9 12" />
    </svg>
  )
}

export function BackIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="10 4 6 8 10 12" />
    </svg>
  )
}
