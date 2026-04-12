// All colours reference CSS custom properties so white-label overrides work automatically.
const catConfig = {
  perf:    { label: 'Performance', bg: 'var(--blb)', text: 'var(--bl)',  dot: 'var(--bl)'  },
  conduct: { label: 'Conduct',     bg: 'var(--ab)',  text: 'var(--at)', dot: 'var(--at)' },
  dev:     { label: 'Development', bg: 'var(--gb)',  text: 'var(--gt)',  dot: 'var(--gt)'  },
}

export function CategoryPill({ cat, showDot = true, className = '' }) {
  const cfg = catConfig[cat] || catConfig.perf
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${className}`}
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      )}
      {cfg.label}
    </span>
  )
}

export function CategoryDot({ cat, size = 8, className = '', onClick }) {
  const cfg = catConfig[cat] || catConfig.perf
  return (
    <span
      className={`inline-block rounded-full flex-shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size, background: cfg.dot }}
      onClick={onClick}
      title={onClick ? `Filter by ${cfg.label}` : cfg.label}
    />
  )
}

export { catConfig }
