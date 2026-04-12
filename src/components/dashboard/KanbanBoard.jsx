import { KanbanCard } from './KanbanCard'

const COLUMNS = [
  { id: 'g', label: 'Going well',    dot: '#5DCAA5', color: '#5DCAA5' },
  { id: 'y', label: 'Working on it', dot: '#EF9F27', color: '#EF9F27' },
  { id: 'r', label: 'Needs work',    dot: '#F09595', color: '#F09595' },
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
                <span className="text-[13px] font-bold" style={{ color }}>{label}</span>
              </div>
              <span className="text-[12px]" style={{ color: 'var(--tm)' }}>{people.length}</span>
            </div>

            {/* Cards */}
            <div className="kb-col-body flex-1 overflow-y-auto max-h-[calc(100vh-260px)] pr-0.5">
              {people.length === 0 ? (
                <div className="text-[13px] py-5 text-center" style={{ color: 'var(--tm)' }}>None</div>
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
