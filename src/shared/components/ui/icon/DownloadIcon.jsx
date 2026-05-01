
export function DownloadIcon({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <path d="M8 2v8M5 7l3 3 3-3" />
      <line x1="2" y1="13" x2="14" y2="13" />
    </svg>
  )
}
