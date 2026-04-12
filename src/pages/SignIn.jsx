import { useNavigate, Link } from 'react-router-dom'
import { storage } from '../utils/storage'

export default function SignIn() {
  const navigate = useNavigate()

  const signIn = () => {
    storage.setAuthed()
    storage.setRole('manager')
    navigate('/dashboard')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--canvas)' }}
    >
      <div
        className="flex w-[820px] max-w-full overflow-hidden"
        style={{ border: '1px solid var(--rule-em)', borderRadius: 'var(--r2)' }}
      >
        {/* Left panel */}
        <div
          className="w-[300px] flex-shrink-0 flex flex-col justify-between"
          style={{ background: 'var(--nav)', padding: '36px 30px' }}
        >
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '5px', textTransform: 'uppercase', color: 'var(--acc-text)' }}>
            CLAU<span style={{ color: 'var(--acc)' }}>SULE</span>
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.4px', color: 'var(--tp)', marginBottom: '12px' }}>
              Thoughtful records.<br />Better conversations.
            </h1>
            <p style={{ fontSize: '14px', fontStyle: 'italic', lineHeight: 1.75, color: 'var(--ts)' }}>
              The file note tool built for managers who care about their people.
            </p>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--tc)' }}>
            Internal use only · Acme Corp
          </div>
        </div>

        {/* Right panel */}
        <div
          className="flex-1 flex flex-col justify-center"
          style={{ background: 'var(--canvas)', padding: '48px 44px' }}
        >
          <h2 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.4px', color: 'var(--tp)', marginBottom: '4px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--tm)', marginBottom: '32px' }}>
            Sign in to your account
          </p>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--tm)', marginBottom: '8px' }}>
              Work email
            </label>
            <input
              type="email"
              placeholder="you@acmecorp.com"
              autoFocus
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1.5px solid var(--rule-em)',
                outline: 'none',
                padding: '8px 0',
                fontSize: '15px',
                color: 'var(--tp)',
                fontFamily: 'var(--font)',
              }}
              onFocus={(e) => { e.target.style.borderBottomColor = 'var(--acc-text)' }}
              onBlur={(e) => { e.target.style.borderBottomColor = 'var(--rule-em)' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--tm)', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1.5px solid var(--rule-em)',
                outline: 'none',
                padding: '8px 0',
                fontSize: '15px',
                color: 'var(--tp)',
                fontFamily: 'var(--font)',
              }}
              onFocus={(e) => { e.target.style.borderBottomColor = 'var(--acc-text)' }}
              onBlur={(e) => { e.target.style.borderBottomColor = 'var(--rule-em)' }}
            />
          </div>

          {/* Remember + forgot */}
          <div className="flex items-center justify-between" style={{ marginBottom: '28px' }}>
            <label className="flex items-center gap-1.5 cursor-pointer" style={{ fontSize: '12px', color: 'var(--ts)' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--acc)' }} />
              Remember me
            </label>
            <button
              style={{ fontSize: '12px', color: 'var(--bl)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
            >
              Forgot password?
            </button>
          </div>

          {/* Sign in */}
          <button
            onClick={signIn}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--acc)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--r)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              marginBottom: '16px',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            Sign in
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
            <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
            <span style={{ fontSize: '11px', color: 'var(--tm)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
          </div>

          {/* SSO */}
          <button
            onClick={signIn}
            className="flex items-center justify-center gap-2"
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              color: 'var(--ts)',
              border: '1.5px solid var(--rule-em)',
              borderRadius: 'var(--r)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              marginBottom: '20px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--rule-em)' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/>
              <rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>
            </svg>
            Continue with SSO
          </button>

          <p style={{ fontSize: '11px', textAlign: 'center', color: 'var(--tm)' }}>
            By signing in you agree to Acme Corp's internal data policy.
          </p>

          <p style={{ fontSize: '12px', textAlign: 'center', color: 'var(--tm)', marginTop: '16px' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--bl)', textDecoration: 'none', fontWeight: 600 }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
