import { useNavigate, Link } from 'react-router-dom'
import { storage } from '../utils/storage'
import '../styles/signin.css'

export default function SignIn() {
  const navigate = useNavigate()

  const signIn = () => {
    storage.setAuthed()
    storage.setRole('manager')
    navigate('/dashboard')
  }

  return (
    <div className="si-wrap">
      <div className="si-card">
        {/* Left panel */}
        <div className="si-left">
          <div className="si-logo">
            CLAU<span className="si-logo-accent">SULE</span>
          </div>
          <div>
            <h1 className="si-tagline">
              Capture Every Win.<br />Retain Every Insight.
            </h1>
            <p className="si-tagline-sub">
              Transforming daily interactions into a permanent record of professional impact.
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="si-right">
          <div className="si-form">
          <h2 className="si-heading">Welcome back</h2>
          <p className="si-subheading">Sign in to your account</p>

          {/* Email */}
          <div className="si-field">
            <label className="si-label">Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              autoFocus
              className="si-input"
            />
          </div>

          {/* Password */}
          <div className="si-field si-field--pw">
            <label className="si-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="si-input"
            />
          </div>

          {/* Remember + forgot */}
          <div className="si-row">
            <label className="si-remember">
              <input type="checkbox" defaultChecked />
              Remember me
            </label>
            <button className="si-forgot">Forgot password?</button>
          </div>

          {/* Sign in */}
          <button onClick={signIn} className="si-btn-primary">
            Sign in
          </button>

          {/* Divider */}
          <div className="si-divider">
            <div className="si-divider-line" />
            <span className="si-divider-text">or</span>
            <div className="si-divider-line" />
          </div>

          {/* SSO */}
          <button onClick={signIn} className="si-btn-sso">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/>
              <rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>
            </svg>
            Continue with SSO
          </button>

          <p className="si-footer">
            Don't have an account?{' '}
            <Link to="/signup">Sign up</Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  )
}
