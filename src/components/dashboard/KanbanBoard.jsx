import { KanbanCard } from './KanbanCard'

const COLUMNS = [
  { id: 'g', label: 'Going well',    dot: '#1D9E75', color: 'var(--teal)', countBg: 'rgba(93,202,165,0.14)',  countColor: 'var(--teal)'  },
  { id: 'y', label: 'Working on it', dot: '#BA7517', color: 'var(--amber)', countBg: 'rgba(239,159,39,0.14)', countColor: 'var(--amber)' },
  { id: 'r', label: 'Needs work',    dot: '#E24B4A', color: 'var(--red)',  countBg: 'rgba(240,149,149,0.14)', countColor: 'var(--red)'   },
]

export function KanbanBoard({ employees }) {
  return (
    <div
      className="flex-1 overflow-hidden grid grid-cols-3"
      style={{ gap: '12px', padding: '14px 18px 18px' }}
    >
      {COLUMNS.map(({ id, label, dot, color, countBg, countColor }) => {
        const people = employees.filter((e) => e.ps === id)
        return (
          <div key={id} className="flex flex-col overflow-hidden">
            {/* Column header */}
            <div className="flex items-center justify-between" style={{ padding: '0 4px 10px' }}>
              <div
                className="flex items-center gap-2"
                style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color }}
              >
                <span className="flex-shrink-0" style={{ width: '10px', height: '10px', borderRadius: '3px', background: dot }} />
                {label}
              </div>
              <span
                style={{
                  fontSize: '11px', fontWeight: 700, padding: '3px 9px',
                  borderRadius: '20px', background: countBg, color: countColor,
                }}
              >
                {people.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {people.length === 0 ? (
                <div style={{ fontSize: '12px', padding: '20px 0', textAlign: 'center', color: 'var(--tx-4)' }}>None</div>
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
