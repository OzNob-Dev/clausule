import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { storage } from '../utils/storage'
import { validateEmail } from '../utils/emailValidation'
import '../styles/signin.css'

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const result = validateEmail(email)
  const showFeedback = touched || submitAttempted

  const sendCode = (e) => {
    e.preventDefault()
    setSubmitAttempted(true)
    if (!result.valid) return
    storage.setEmail(email.trim())
    navigate('/mfa-setup')
  }

  const acceptSuggestion = () => {
    setEmail(result.suggestion)
    setTouched(false)
    setSubmitAttempted(false)
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
              <label className="si-label" htmlFor="si-email">Email</label>
              <input
                id="si-email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSubmitAttempted(false) }}
                onBlur={() => email.trim() && setTouched(true)}
                autoFocus
                autoComplete="email"
                required
                aria-invalid={showFeedback && !result.valid && !result.suggestion}
                aria-describedby={showFeedback && (result.error || result.suggestion) ? 'si-email-hint' : undefined}
                className={`si-input${showFeedback && result.error ? ' si-input--error' : ''}${showFeedback && result.suggestion ? ' si-input--warn' : ''}`}
              />
              {showFeedback && result.error && (
                <p id="si-email-hint" className="si-field-hint si-field-hint--error" role="alert">
                  {result.error}
                </p>
              )}
              {showFeedback && result.suggestion && (
                <p id="si-email-hint" className="si-field-hint si-field-hint--suggest" role="alert">
                  Did you mean{' '}
                  <button type="button" className="si-suggest-btn" onClick={acceptSuggestion}>
                    {result.suggestion}
                  </button>
                  ?
                </p>
              )}
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
