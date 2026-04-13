import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { storage } from '../utils/storage'
import '../styles/signin.css'

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const sendCode = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    storage.setEmail(email.trim())
    navigate('/mfa-setup')
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
          <form className="si-form" onSubmit={sendCode} noValidate>
            <h2 className="si-heading">Sign in</h2>
            <p className="si-subheading">We'll send a verification code to your email.</p>

            <div className="si-field">
              <label className="si-label" htmlFor="si-email">Work email</label>
              <input
                id="si-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                autoComplete="email"
                required
                className="si-input"
              />
            </div>

            <button type="submit" className="si-btn-primary" disabled={!email.trim()}>
              Send code
            </button>

            <p className="si-footer">
              No account yet?{' '}
              <Link to="/signup">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
