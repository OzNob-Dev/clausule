import { authShell } from '@features/signup/components/signupClasses'

export default function SignInBrandPanel() {
  return (
    <div className={`si-left ${authShell.darkPanel}`}>
      <div className={authShell.brandRow}>
        <div className={authShell.brandBug}>
          <svg viewBox="0 0 18 18" fill="none" stroke="#FBF7F2" strokeWidth="2.2" strokeLinecap="round" style={{ width: 15, height: 15 }}>
            <path d="M3 5h12M3 9h8M3 13h5" />
          </svg>
        </div>
        <span className={authShell.brandTextDark}>clausule</span>
      </div>
      <div className={authShell.leftBody}>
        <h1 className={authShell.headline}>Thoughtful records.<br />Better conversations.</h1>
        <p className={authShell.headlineSub}>The file note tool built for managers who care about their people — and a brag doc for the people themselves.</p>
      </div>
      <div className={authShell.footer}>Built for teams who care</div>
    </div>
  )
}
