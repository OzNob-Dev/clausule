import { cn } from '@shared/utils/cn'
import { Button } from './Button'

const catConfig = {
  perf:    { label: 'Performance', mod: 'perf'    },
  conduct: { label: 'Conduct',     mod: 'conduct' },
  dev:     { label: 'Development', mod: 'dev'     },
}

const pillStyles = {
  perf: { pill: 'bg-blb text-blt', dot: 'bg-blt' },
  conduct: { pill: 'bg-ab text-at', dot: 'bg-at' },
  dev: { pill: 'bg-gb text-gt', dot: 'bg-gt' },
}

const dotSizeClass = {
  6: 'h-1.5 w-1.5',
  8: 'h-2 w-2',
  10: 'h-2.5 w-2.5',
  12: 'h-3 w-3',
  14: 'h-3.5 w-3.5',
  16: 'h-4 w-4',
}

export function CategoryPill({ cat, showDot = false, className = '' }) {
  const cfg = catConfig[cat] ?? catConfig.perf
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold', pillStyles[cfg.mod].pill, className)}>
      {showDot && <span className={cn('h-2 w-2 rounded-full', pillStyles[cfg.mod].dot)} />}
      {cfg.label}
    </span>
  )
}

export function CategoryDot({ cat, size = 8, className = '', onClick }) {
  const cfg = catConfig[cat] ?? catConfig.perf
  const sizeClass = dotSizeClass[size] ?? dotSizeClass[8]
  const dot = cn(
    'inline-flex shrink-0 rounded-full border border-transparent',
    sizeClass,
    pillStyles[cfg.mod].dot,
    onClick && 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-acc-text focus-visible:outline-offset-2',
    className
  )

  return onClick ? (
    <Button
      type="button"
      className={dot}
      onClick={onClick}
      title={`Filter by ${cfg.label}`}
      aria-label={`Filter by ${cfg.label}`}
      variant="ghost"
    />
  ) : (
    <span className={dot} title={cfg.label} aria-hidden="true" />
  )
}
