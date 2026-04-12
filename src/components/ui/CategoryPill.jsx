// All colours reference CSS custom properties so white-label overrides work automatically.
const catConfig = {
  perf:    { label: 'Performance', pillClass: 'bg-[var(--blb)] text-[var(--bl)]',  dotClass: 'bg-[var(--bl)]'  },
  conduct: { label: 'Conduct',     pillClass: 'bg-[var(--ab)]  text-[var(--at)]',  dotClass: 'bg-[var(--at)]' },
  dev:     { label: 'Development', pillClass: 'bg-[var(--gb)]  text-[var(--gt)]',  dotClass: 'bg-[var(--gt)]'  },
}

export function CategoryPill({ cat, showDot = false, className = '' }) {
  const cfg = catConfig[cat] || catConfig.perf
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-[0.5px] ${cfg.pillClass} ${className}`}
    >
      {showDot && (
        <span className={`w-1 h-1 rounded-full flex-shrink-0 ${cfg.dotClass}`} />
      )}
      {cfg.label}
    </span>
  )
}

export function CategoryDot({ cat, size = 8, className = '', onClick }) {
  const cfg = catConfig[cat] || catConfig.perf
  return (
    <span
      className={`inline-block flex-shrink-0 rounded-[3px] ${cfg.dotClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ '--dot-sz': `${size}px`, width: `${size}px`, height: `${size}px` }}
      onClick={onClick}
      title={onClick ? `Filter by ${cfg.label}` : cfg.label}
    />
  )
}

export { catConfig }
