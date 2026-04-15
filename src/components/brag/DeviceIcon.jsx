export default function DeviceIcon({ type }) {
  if (type === 'phone') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <circle cx="12" cy="17.5" r="1"/>
    </svg>
  )
  if (type === 'tablet') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <circle cx="12" cy="17.5" r="1"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="4" width="20" height="14" rx="2"/>
      <path d="M8 22h8M12 18v4"/>
    </svg>
  )
}
