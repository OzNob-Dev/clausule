const OPTIONS = [
  { id: 'g', label: 'Going well',    bg: 'rgba(93,202,165,0.14)',  color: '#5DCAA5', activeBg: '#5DCAA5' },
  { id: 'y', label: 'Working on it', bg: 'rgba(239,159,39,0.14)',  color: '#EF9F27', activeBg: '#EF9F27' },
  { id: 'r', label: 'Needs work',    bg: 'rgba(240,149,149,0.14)', color: '#F09595', activeBg: '#F09595' },
]

export function PitstopSelector({ value, onSelect, saved }) {
  return (
    <div className="flex items-center gap-2">
      {OPTIONS.map((opt) => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border border-transparent [background:var(--ps-bg)] [color:var(--ps-color)] ${
              active ? 'opacity-100 scale-[1.02]' : 'opacity-60 hover:opacity-90'
            }`}
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
      <span className={`text-[11px] text-[var(--tm)] transition-opacity duration-300 ml-1 ${saved ? 'opacity-100' : 'opacity-0'}`}>
        Saved
      </span>
    </div>
  )
}
