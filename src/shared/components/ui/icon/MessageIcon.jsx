import './MessageIcon.css'

export function MessageIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path d="M5 5.5h14v9H9.5L5 18v-12.5Z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  )
}
