
export function ProfileIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.8-3 4.3-4.5 7-4.5s5.2 1.5 7 4.5" />
    </svg>
  )
}
