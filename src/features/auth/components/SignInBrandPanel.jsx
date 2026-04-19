export default function SignInBrandPanel() {
  return (
    <div className="si-left">
      <div className="si-logo">
        <div className="si-logo-bug">
          <svg viewBox="0 0 18 18" fill="none" stroke="#FBF7F2" strokeWidth="2.2" strokeLinecap="round" style={{ width: 15, height: 15 }}>
            <path d="M3 5h12M3 9h8M3 13h5" />
          </svg>
        </div>
        <span className="si-brand-name">clausule</span>
      </div>
      <div className="si-left-body">
        <h1 className="si-tagline">Thoughtful records.<br />Better conversations.</h1>
        <p className="si-tagline-sub">The file note tool built for managers who care about their people — and a brag doc for the people themselves.</p>
      </div>
      <div className="si-left-footer">Built for teams who care</div>
    </div>
  )
}
