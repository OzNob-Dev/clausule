
export function TrashIcon({ size = 14, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <polyline points="2 4 3 4 12 4" />
      <path d="M11 4l-.7 8a1 1 0 0 1-1 1H4.7a1 1 0 0 1-1-1L3 4" />
      <path d="M5.5 4V3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1" />
    </svg>
  )
}
