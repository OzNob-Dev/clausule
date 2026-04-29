export function ProfileFormCard({ children, ...props }) {
  return (
    <form className="form-card" role="form" aria-label="Personal details form" {...props}>
      <div className="form-card-head">
        <span className="form-card-title">Your profile</span>
        <span className="form-card-meta">Account settings</span>
      </div>
      <div className="form-body">
        {children}
      </div>
    </form>
  )
}
