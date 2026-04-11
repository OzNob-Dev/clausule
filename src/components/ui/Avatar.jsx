export function Avatar({ initials, bg, color, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-[13px]',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-medium flex-shrink-0 ${className}`}
      style={{ background: bg, color }}
    >
      {initials}
    </div>
  )
}
