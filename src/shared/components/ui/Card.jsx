import { cn } from '@shared/utils/cn'

const toneStyles = {
  default: 'border-rule bg-card',
  elevated: 'border-rule bg-card shadow-[var(--cl-shadow-card-soft)]',
  inset: 'border-rule bg-canvas',
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ as: Component = 'div', tone = 'default', padding = 'md', className = '', children, ...props }) {
  return (
    <Component className={cn('rounded-[1.75rem] border', toneStyles[tone] ?? toneStyles.default, paddingStyles[padding] ?? paddingStyles.md, className)} {...props}>
      {children}
    </Component>
  )
}
