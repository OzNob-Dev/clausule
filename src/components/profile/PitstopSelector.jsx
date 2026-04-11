const OPTIONS = [
  { id: 'g', label: 'Going well',    bg: '#EAF3DE', color: '#3B6D11', activeBg: '#3B6D11' },
  { id: 'y', label: 'Working on it', bg: '#FAEEDA', color: '#854F0B', activeBg: '#854F0B' },
  { id: 'r', label: 'Needs work',    bg: '#FCEBEB', color: '#A32D2D', activeBg: '#A32D2D' },
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
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${
              active
                ? 'opacity-100 scale-[1.02]'
                : 'opacity-60 hover:opacity-90'
            }`}
            style={
              active
                ? { background: opt.activeBg, color: '#fff', borderColor: 'transparent' }
                : { background: opt.bg, color: opt.color, borderColor: 'transparent' }
            }
          >
            {opt.label}
          </button>
        )
      })}
      <span
        className={`text-[11px] text-tm transition-opacity duration-300 ml-1 ${saved ? 'opacity-100' : 'opacity-0'}`}
      >
        Saved
      </span>
    </div>
  )
}
