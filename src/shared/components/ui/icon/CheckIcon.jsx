import './CheckIcon.css'

export function CheckIcon({ size = 12, strokeWidth = 2.5, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden="true" {...props}>
      <polyline points="3 8 6 11 13 4" />
    </svg>
  )
}
