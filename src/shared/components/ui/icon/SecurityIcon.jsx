import './SecurityIcon.css'

export function SecurityIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <rect x="4.5" y="10.5" width="15" height="9" rx="2.25" />
      <path d="M8 10.5V8.25a4 4 0 0 1 8 0v2.25" />
      <path d="M12 14v2.25" />
    </svg>
  )
}
