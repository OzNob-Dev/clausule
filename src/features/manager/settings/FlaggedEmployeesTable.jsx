import { FLAGGED_EMPLOYEES } from '@shared/data/employees'

export default function FlaggedEmployeesTable() {
  return (
    <div className="st-flagged-section">
      <div className="st-flagged-label">Currently flagged · {FLAGGED_EMPLOYEES.length}</div>
      <div className="st-flagged-table">
        <div className="st-flagged-header">
          {['Employee', 'Reason', 'Days', 'Risk'].map((heading) => (
            <div key={heading} className="st-flagged-hcell">{heading}</div>
          ))}
        </div>
        {FLAGGED_EMPLOYEES.map((employee) => (
          <div key={employee.name} className="st-flagged-row">
            <div>
              <div className="st-flagged-name">{employee.name}</div>
              <div className="st-flagged-role">{employee.role} · {employee.team}</div>
            </div>
            <div className="st-flagged-cell">{employee.reason}</div>
            <div className="st-flagged-cell">{employee.days}d</div>
            <div>
              <span className="st-risk-badge">{employee.risk}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
