import './CategoryPill.css'

const CATEGORY_LABELS = {
  conduct: 'Conduct',
  dev: 'Development',
}

function labelFor(cat) {
  return CATEGORY_LABELS[cat] ?? cat.replace(/^[a-z]/, (m) => m.toUpperCase())
}

export function CategoryPill({ cat, showDot = false }) {
  const label = labelFor(cat)

  return (
    <span className="inline-flex items-center gap-2">
      {showDot ? <CategoryDot cat={cat} /> : null}
      <span>{label}</span>
    </span>
  )
}

export function CategoryDot({ cat, onClick }) {
  const label = labelFor(cat)

  return onClick ? (
    <button type="button" aria-label={`Filter by ${label}`} onClick={onClick} className="inline-flex h-5 w-5 items-center justify-center rounded-full">
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />
    </button>
  ) : (
    <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-full">
      <span className="h-2 w-2 rounded-full bg-current" />
    </span>
  )
}
