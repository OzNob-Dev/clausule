export default function BragLoadingState() {
  return (
    <div className="be-loading" role="status" aria-live="polite" aria-label="Loading entries">
      <div className="be-loading-mark" aria-hidden="true">
        <span className="be-loading-ring be-loading-ring--outer" />
        <span className="be-loading-ring be-loading-ring--mid" />
        <span className="be-loading-ring be-loading-ring--inner" />
        <svg className="be-loading-pencil" viewBox="0 0 48 48" fill="none">
          <path d="M13 34 11 41l7-2 20-20-5-5L13 34Z" fill="currentColor" opacity="0.16" />
          <path d="M13 34 11 41l7-2 20-20-5-5L13 34Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="m30 17 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 34h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <p className="be-loading-title">Gathering your wins</p>
      <div className="be-loading-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}
