import '../../styles/category-pill.css'

// All colours reference CSS custom properties so white-label overrides work automatically.
const catConfig = {
  perf:    { label: 'Performance', mod: 'perf'    },
  conduct: { label: 'Conduct',     mod: 'conduct' },
  dev:     { label: 'Development', mod: 'dev'     },
}

export function CategoryPill({ cat, showDot = false, className = '' }) {
  const cfg = catConfig[cat] || catConfig.perf
  return (
    <span className={`cpill cpill--${cfg.mod}${className ? ` ${className}` : ''}`}>
      {showDot && <span className="cpill__dot" />}
      {cfg.label}
    </span>
  )
}

export function CategoryDot({ cat, size = 8, className = '', onClick }) {
  const cfg = catConfig[cat] || catConfig.perf
  return (
    <span
      className={`cdot cdot--${cfg.mod}${onClick ? ' cdot--clickable' : ''}${className ? ` ${className}` : ''}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      onClick={onClick}
      title={onClick ? `Filter by ${cfg.label}` : cfg.label}
    />
  )
}

export { catConfig }
