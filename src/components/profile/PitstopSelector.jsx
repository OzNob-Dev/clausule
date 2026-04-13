import '../../styles/pitstop-selector.css'

const OPTIONS = [
  { id: 'g', label: 'Going well',    bg: 'rgba(93,202,165,0.14)',  color: '#5DCAA5', activeBg: '#5DCAA5' },
  { id: 'y', label: 'Working on it', bg: 'rgba(239,159,39,0.14)',  color: '#EF9F27', activeBg: '#EF9F27' },
  { id: 'r', label: 'Needs work',    bg: 'rgba(240,149,149,0.14)', color: '#F09595', activeBg: '#F09595' },
]

export function PitstopSelector({ value, onSelect, saved }) {
  return (
    <div className="ps-wrap">
      {OPTIONS.map((opt) => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`ps-btn${active ? ' ps-btn--active' : ''}`}
            style={
              active
                ? { '--ps-bg': opt.activeBg, '--ps-color': 'var(--canvas)' }
                : { '--ps-bg': opt.bg,       '--ps-color': opt.color }
            }
          >
            {opt.label}
          </button>
        )
      })}
      <span className={`ps-saved${saved ? ' ps-saved--visible' : ''}`}>
        Saved
      </span>
    </div>
  )
}
