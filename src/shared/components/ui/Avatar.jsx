import './Avatar.css'

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-sm',
}

export function Avatar({ initials, bg = 'var(--cl-surface-muted)', color = 'var(--cl-surface-ink)', size = 'md' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-full font-semibold ${SIZE_CLASSES[size] ?? SIZE_CLASSES.md}`} style={{ '--avatar-bg': bg, '--avatar-fg': color }}>
      {initials}
    </div>
  )
}
