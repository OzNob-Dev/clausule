export function DeviceLockIcon({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" {...props}>
      <rect x="3" y="7" width="10" height="8" rx="1.5" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" />
      <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
