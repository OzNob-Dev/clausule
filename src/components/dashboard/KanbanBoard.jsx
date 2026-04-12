import { KanbanCard } from './KanbanCard'

const COLUMNS = [
  { id: 'g', label: 'Going well',    dot: '#1D9E75', color: 'var(--teal)', countBg: 'rgba(93,202,165,0.14)',  countColor: 'var(--teal)'  },
  { id: 'y', label: 'Working on it', dot: '#BA7517', color: 'var(--amber)', countBg: 'rgba(239,159,39,0.14)', countColor: 'var(--amber)' },
  { id: 'r', label: 'Needs work',    dot: '#E24B4A', color: 'var(--red)',  countBg: 'rgba(240,149,149,0.14)', countColor: 'var(--red)'   },
]

export function KanbanBoard({ employees }) {
  return (
    <div className="flex-1 overflow-hidden grid grid-cols-3 gap-3 px-[18px] pt-[14px] pb-[18px]">
      {COLUMNS.map(({ id, label, dot, color, countBg, countColor }) => {
        const people = employees.filter((e) => e.ps === id)
        return (
          <div key={id} className="flex flex-col overflow-hidden">
            {/* Column header */}
            <div className="flex items-center justify-between px-1 pb-[10px]">
              <div
                className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.8px] [color:var(--col-color)]"
                style={{ '--col-color': color }}
              >
                <span
                  className="flex-shrink-0 w-[10px] h-[10px] rounded-[3px] [background:var(--dot-bg)]"
                  style={{ '--dot-bg': dot }}
                />
                {label}
              </div>
              <span
                className="text-[11px] font-bold px-[9px] py-[3px] rounded-[20px] [background:var(--cnt-bg)] [color:var(--cnt-color)]"
                style={{ '--cnt-bg': countBg, '--cnt-color': countColor }}
              >
                {people.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 kb-col-body">
              {people.length === 0 ? (
                <div className="text-[12px] py-5 text-center text-[var(--tc)]">None</div>
              ) : (
                people.map((emp) => <KanbanCard key={emp.name} emp={emp} />)
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
