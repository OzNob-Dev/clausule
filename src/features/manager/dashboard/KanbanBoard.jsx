import { KanbanCard } from './KanbanCard'

const COLUMNS = [
  { id: 'g', label: 'Going well', headerClass: 'text-[#1D9E75]', dotClass: 'bg-[#1D9E75]', badgeClass: 'bg-[rgba(93,202,165,0.14)] text-[#1D9E75]' },
  { id: 'y', label: 'Working on it', headerClass: 'text-[#BA7517]', dotClass: 'bg-[#BA7517]', badgeClass: 'bg-[rgba(239,159,39,0.14)] text-[#BA7517]' },
  { id: 'r', label: 'Needs work', headerClass: 'text-[#E24B4A]', dotClass: 'bg-[#E24B4A]', badgeClass: 'bg-[rgba(240,149,149,0.14)] text-[#E24B4A]' },
]

export function KanbanBoard({ employeesByStatus, employees = [] }) {
  const groupedEmployees = employeesByStatus ?? employees.reduce((groups, employee) => {
    if (groups[employee.ps]) groups[employee.ps].push(employee)
    return groups
  }, { g: [], y: [], r: [] })

  return (
    <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
      <div className="grid grid-cols-3 gap-3 pt-[14px] px-[18px] pb-[18px] h-full min-w-[max(100%,480px)]">
        {COLUMNS.map(({ id, label, headerClass, dotClass, badgeClass }) => {
          const people = groupedEmployees[id] ?? []
          return (
            <div key={id} className="flex flex-col overflow-hidden" role="group" aria-label={`${label} — ${people.length} ${people.length === 1 ? 'person' : 'people'}`}>
              {/* Column header */}
              <div className="flex items-center justify-between px-1 pt-0 pb-[10px]">
                <div className={`flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.8px] ${headerClass}`}>
                  <span className={`shrink-0 h-2.5 w-2.5 rounded-[3px] ${dotClass}`} />
                  {label}
                </div>
                <span className={`rounded-full px-[9px] py-[3px] text-[11px] font-bold ${badgeClass}`}>
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
