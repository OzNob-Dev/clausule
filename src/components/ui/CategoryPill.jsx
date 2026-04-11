const catConfig = {
  perf:    { label: 'Performance', bg: '#E6F1FB', text: '#185FA5', dot: '#4A6FA5' },
  conduct: { label: 'Conduct',     bg: '#FAEEDA', text: '#854F0B', dot: '#BA7517' },
  dev:     { label: 'Development', bg: '#EAF3DE', text: '#3B6D11', dot: '#639922' },
}

export function CategoryPill({ cat, showDot = true, className = '' }) {
  const cfg = catConfig[cat] || catConfig.perf
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${className}`}
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
