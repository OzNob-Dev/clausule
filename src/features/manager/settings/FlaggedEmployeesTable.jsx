import { FLAGGED_EMPLOYEES } from '@shared/data/employees'

export default function FlaggedEmployeesTable() {
  return (
    <div className="st-flagged-section">
      <div className="st-flagged-label">Currently flagged · {FLAGGED_EMPLOYEES.length}</div>
      <div className="st-flagged-table-wrap">
        <table className="st-flagged-table">
          <caption className="sr-only">Flagged employees requiring attention</caption>
          <colgroup>
            <col />
            <col className="st-flagged-col-reason" />
            <col className="st-flagged-col-days" />
            <col className="st-flagged-col-risk" />
          </colgroup>
          <thead>
            <tr>
              {['Employee', 'Reason', 'Days', 'Risk'].map((heading) => (
                <th key={heading} scope="col" className="st-flagged-hcell">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FLAGGED_EMPLOYEES.map((employee) => (
              <tr key={employee.id} className="st-flagged-row">
                <th scope="row" className="st-flagged-person">
                  <div className="st-flagged-name">{employee.name}</div>
                  <div className="st-flagged-role">{employee.role} · {employee.team}</div>
                </th>
                <td className="st-flagged-cell">{employee.reason}</td>
                <td className="st-flagged-cell">{employee.days}d</td>
                <td className="st-flagged-cell">
                  <span className="st-risk-badge">{employee.risk}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
