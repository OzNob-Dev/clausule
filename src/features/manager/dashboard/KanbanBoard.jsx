import { KanbanCard } from './KanbanCard'

const COLUMNS = [
  { id: 'g', label: 'Going well',    dot: '#1D9E75', color: 'var(--teal)', countBg: 'rgba(93,202,165,0.14)',  countColor: 'var(--teal)'  },
  { id: 'y', label: 'Working on it', dot: '#BA7517', color: 'var(--amber)', countBg: 'rgba(239,159,39,0.14)', countColor: 'var(--amber)' },
  { id: 'r', label: 'Needs work',    dot: '#E24B4A', color: 'var(--red)',  countBg: 'rgba(240,149,149,0.14)', countColor: 'var(--red)'   },
]

export function KanbanBoard({ employeesByStatus, employees = [] }) {
  const groupedEmployees = employeesByStatus ?? employees.reduce((groups, employee) => {
    if (groups[employee.ps]) groups[employee.ps].push(employee)
    return groups
  }, { g: [], y: [], r: [] })

  return (
    <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
      <div className="grid grid-cols-3 gap-3 pt-[14px] px-[18px] pb-[18px] h-full min-w-[max(100%,480px)]">
        {COLUMNS.map(({ id, label, dot, color, countBg, countColor }) => {
          const people = groupedEmployees[id] ?? []
          return (
            <div key={id} className="flex flex-col overflow-hidden">
              {/* Column header */}
              <div className="flex items-center justify-between px-1 pt-0 pb-[10px]">
                <div
                  className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.8px]"
                  style={{ color: color }}
                >
                  <span
                    className="shrink-0 w-2.5 h-2.5 rounded-[3px]"
                    style={{ background: dot }}
                  />
                  {label}
                </div>
                <span
                  className="text-[11px] font-bold py-[3px] px-[9px] rounded-full"
                  style={{ background: countBg, color: countColor }}
                >
                  {people.length}
                </span>
              </div>

              {/* Cards */}
              <div className="kb-col-body overflow-y-auto">
                {people.length === 0 ? (
                  <div className="text-xs py-5 px-0 text-center text-tc">None</div>
                ) : (
                  people.map((emp) => <KanbanCard key={emp.id} emp={emp} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
