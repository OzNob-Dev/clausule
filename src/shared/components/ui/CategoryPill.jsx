import { cn } from '@shared/utils/cn'

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

export function CategoryPill({ cat, showDot = false, className = '' }) {
  const cfg = catConfig[cat] || catConfig.perf
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold', pillStyles[cfg.mod].pill, className)}>
      {showDot && <span className={cn('h-2 w-2 rounded-full', pillStyles[cfg.mod].dot)} />}
      {cfg.label}
    </span>
  )
}

export function CategoryDot({ cat, size = 8, className = '', onClick }) {
  const cfg = catConfig[cat] || catConfig.perf
  const dot = cn(
    'inline-flex shrink-0 rounded-full border border-transparent',
    pillStyles[cfg.mod].dot,
    onClick && 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-acc-text focus-visible:outline-offset-2',
    className
  )

  return onClick ? (
    <button
      type="button"
      className={dot}
      style={{ width: `${size}px`, height: `${size}px` }}
      onClick={onClick}
      title={`Filter by ${cfg.label}`}
      aria-label={`Filter by ${cfg.label}`}
    />
  ) : (
    <span className={dot} style={{ width: `${size}px`, height: `${size}px` }} title={cfg.label} aria-hidden="true" />
  )
}
