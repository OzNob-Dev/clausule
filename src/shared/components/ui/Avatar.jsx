import { cn } from '@shared/utils/cn'

export function Avatar({ initials, bg, color, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold leading-none shrink-0 bg-[var(--avatar-bg)] text-[var(--avatar-fg)]',
        sizes[size] ?? sizes.md,
        className
      )}
      style={{ '--avatar-bg': bg, '--avatar-fg': color }}
    >
      {initials}
    </div>
  )
}
