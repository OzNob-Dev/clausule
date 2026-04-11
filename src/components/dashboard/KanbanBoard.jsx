import { KanbanCard } from './KanbanCard'

const COLUMNS = [
  { id: 'g', label: 'Going well',    dot: '#639922', color: '#3B6D11' },
  { id: 'y', label: 'Working on it', dot: '#BA7517', color: '#854F0B' },
  { id: 'r', label: 'Needs work',    dot: '#E24B4A', color: '#A32D2D' },
]

export function KanbanBoard({ employees }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {COLUMNS.map(({ id, label, dot, color }) => {
        const people = employees.filter((e) => e.ps === id)
        return (
          <div key={id} className="flex flex-col">
            {/* Column header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
                <span className="text-[13px] font-medium" style={{ color }}>{label}</span>
              </div>
              <span className="text-[12px] text-tm dark:text-[#6B6B68]">{people.length}</span>
            </div>

            {/* Cards */}
            <div className="kb-col-body flex-1 overflow-y-auto max-h-[calc(100vh-260px)] pr-0.5">
              {people.length === 0 ? (
                <div className="text-[13px] text-tm dark:text-[#6B6B68] py-5 text-center">None</div>
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
