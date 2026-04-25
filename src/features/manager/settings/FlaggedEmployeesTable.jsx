export default function FlaggedEmployeesTable() {
  return (
    <div className="st-flagged-section">
      <div className="st-flagged-label">Flagged employees</div>
      <div className="st-flagged-table-wrap">
        <div className="rounded-[var(--r)] border border-dashed border-border bg-canvas px-4 py-5 text-[13px] leading-[1.7] text-tx-3" role="status">
          Flagged employee records will appear here once the manager workspace is connected to live HR and file-note data.
        </div>
      </div>
    </div>
  )
}
