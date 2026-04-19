import { KanbanCard } from './KanbanCard'
import '@features/manager/styles/kanban.css'

const COLUMNS = [
  { id: 'g', label: 'Going well',    dot: '#1D9E75', color: 'var(--teal)', countBg: 'rgba(93,202,165,0.14)',  countColor: 'var(--teal)'  },
  { id: 'y', label: 'Working on it', dot: '#BA7517', color: 'var(--amber)', countBg: 'rgba(239,159,39,0.14)', countColor: 'var(--amber)' },
  { id: 'r', label: 'Needs work',    dot: '#E24B4A', color: 'var(--red)',  countBg: 'rgba(240,149,149,0.14)', countColor: 'var(--red)'   },
]

export function KanbanBoard({ employees }) {
  return (
    <div className="kb-board">
      <div className="kb-grid">
        {COLUMNS.map(({ id, label, dot, color, countBg, countColor }) => {
          const people = employees.filter((e) => e.ps === id)
          return (
            <div key={id} className="kb-col">
              {/* Column header */}
              <div className="kb-col-head">
                <div
                  className="kb-col-label"
                  style={{ '--col-color': color }}
                >
                  <span
                    className="kb-col-dot"
                    style={{ '--dot-bg': dot }}
                  />
                  {label}
                </div>
                <span
                  className="kb-count"
                  style={{ '--cnt-bg': countBg, '--cnt-color': countColor }}
                >
                  {people.length}
                </span>
              </div>

              {/* Cards */}
              <div className="kb-col-body">
                {people.length === 0 ? (
                  <div className="kb-empty">None</div>
                ) : (
                  people.map((emp) => <KanbanCard key={emp.name} emp={emp} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
