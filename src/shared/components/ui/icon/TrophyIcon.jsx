import './TrophyIcon.css'

export function TrophyIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M8 21h8M12 17v4M17 3H7l-1 8h10l-1-8zM7 11c0 2.76 2.24 5 5 5s5-2.24 5-5" />
    </svg>
  )
}
