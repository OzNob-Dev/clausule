import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { storage } from '../utils/storage'

function MoonIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z"/>
    </svg>
  )
}

export default function SignIn() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(() => storage.getTheme() === 'dark')
  const [role, setRole] = useState('manager')
  const [step, setStep] = useState('role') // 'role' | 'creds'

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    storage.setTheme(dark ? 'dark' : 'light')
  }, [dark])

  const goToCreds = () => setStep('creds')
  const goBack = () => setStep('role')

  const signIn = () => {
    storage.setAuthed()
    storage.setRole(role)
    navigate(role === 'employee' ? '/brag' : '/dashboard')
  }

  const isEmp = role === 'employee'

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 transition-colors duration-200"
      style={{ background: 'var(--canvas)' }}
    >
      <div
        className="flex w-[840px] max-w-full overflow-hidden"
        style={{ border: '1px solid var(--rule-em)', borderRadius: 'var(--r2)' }}
      >
        {/* Left panel */}
        <div
          className="w-[300px] flex-shrink-0 flex flex-col justify-between p-[36px_30px]"
          style={{ background: 'var(--nav)' }}
        >
          <div
            className="text-[10px] font-bold tracking-[5px] uppercase select-none"
            style={{ color: 'var(--acc-text)' }}
          >
            CLAU<span style={{ color: 'var(--acc)' }}>SULE</span>
          </div>
          <div>
            <h1
              className="text-[28px] font-black leading-tight tracking-[-0.4px] mb-3"
              style={{ color: 'var(--tp)' }}
            >
              Thoughtful records.<br />Better conversations.
            </h1>
            <p
              className="text-[14px] font-normal italic leading-[1.75]"
              style={{ color: 'var(--ts)' }}
            >
              The file note tool built for managers who care about their people — and a brag doc for the people themselves.
            </p>
          </div>
          <div className="text-[11px]" style={{ color: 'var(--tc)' }}>
            Internal use only · Acme Corp
          </div>
        </div>

        {/* Right panel */}
        <div
          className="flex-1 p-[44px_40px] flex flex-col justify-center relative"
          style={{ background: 'var(--canvas)' }}
        >
          <button
            onClick={() => setDark((d) => !d)}
            className="absolute top-4 right-4 w-[30px] h-[30px] flex items-center justify-center rounded-clausule bg-transparent transition-colors"
            style={{ border: '1px solid var(--rule)', color: 'var(--tm)' }}
          >
            <MoonIcon />
          </button>

          {/* Step 1: Role selector */}
          {step === 'role' && (
            <div className="flex flex-col">
              <h2
                className="text-[26px] font-black tracking-[-0.4px] mb-1"
                style={{ color: 'var(--tp)' }}
              >
                Welcome back
              </h2>
              <p className="text-[13px] mb-7" style={{ color: 'var(--tm)' }}>
                How are you signing in today?
              </p>

              <div className="flex flex-col gap-2.5 mb-6">
                {/* Manager card */}
                <button
                  onClick={() => setRole('manager')}
                  className="flex items-center gap-4 p-[16px_18px] rounded-clausule cursor-pointer transition-all text-left"
                  style={{
                    border: `1.5px solid ${role === 'manager' ? 'var(--acc)' : 'var(--rule)'}`,
                    background: role === 'manager' ? 'var(--acc-tint)' : 'transparent',
                  }}
                >
                  <div
                    className="w-[38px] h-[38px] rounded-clausule flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--acc-tint)', color: 'var(--acc-text)' }}
                  >
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2" width="12" height="12" rx="1"/>
                      <line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="8" y2="11"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold" style={{ color: 'var(--tp)' }}>Manager / HR</div>
                    <div className="text-[12px] mt-0.5" style={{ color: 'var(--tm)' }}>Access file notes, dashboards, and team records</div>
                  </div>
                  <div
                    className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      border: role === 'manager' ? '1.5px solid transparent' : '1.5px solid var(--rule)',
                      background: role === 'manager' ? 'var(--acc)' : 'transparent',
                    }}
                  >
                    {role === 'manager' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>

                {/* Employee card */}
                <button
                  onClick={() => setRole('employee')}
                  className="flex items-center gap-4 p-[16px_18px] rounded-clausule cursor-pointer transition-all text-left"
                  style={{
                    border: `1.5px solid ${role === 'employee' ? 'var(--acc)' : 'var(--rule)'}`,
                    background: role === 'employee' ? 'var(--acc-tint)' : 'transparent',
                  }}
                >
                  <div
                    className="w-[38px] h-[38px] rounded-clausule flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--acc-tint)', color: 'var(--acc-text)' }}
                  >
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold" style={{ color: 'var(--tp)' }}>Employee</div>
                    <div className="text-[12px] mt-0.5" style={{ color: 'var(--tm)' }}>View and add to your brag doc</div>
                  </div>
                  <div
                    className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      border: role === 'employee' ? '1.5px solid transparent' : '1.5px solid var(--rule)',
                      background: role === 'employee' ? 'var(--acc)' : 'transparent',
                    }}
                  >
                    {role === 'employee' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              </div>

              <button
                onClick={goToCreds}
                className="w-full py-3 text-[13px] font-bold tracking-[0.2px] rounded-clausule text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--acc)' }}
              >
                Continue
              </button>
              <p className="text-[11px] text-center mt-4" style={{ color: 'var(--tm)' }}>
                By signing in you agree to Acme Corp's internal data policy.
              </p>
            </div>
          )}

          {/* Step 2: Credentials */}
          {step === 'creds' && (
            <div className="flex flex-col">
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-[12px] transition-colors mb-6 bg-transparent border-0 p-0 cursor-pointer font-sans"
                style={{ color: 'var(--tm)' }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="10 4 6 8 10 12"/>
                </svg>
                Back
              </button>

              <div
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-clausule mb-6 text-[13px]"
                style={{ background: 'var(--acc-tint)', color: 'var(--acc-text)' }}
              >
                {isEmp ? (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="12" height="12" rx="1"/>
                    <line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="8" y2="11"/>
                  </svg>
                )}
                <span className="font-bold">Signing in as {isEmp ? 'Employee' : 'Manager / HR'}</span>
              </div>

              <div className="flex flex-col gap-1.5 mb-[18px]">
                <label className="text-[9px] font-bold uppercase tracking-[0.6px]" style={{ color: 'var(--tm)' }}>Work email</label>
                <input
                  type="email"
                  placeholder="you@acmecorp.com"
                  autoFocus
                  className="bg-transparent border-0 pb-2.5 pt-2.5 text-[15px] outline-none transition-colors w-full"
                  style={{
                    color: 'var(--tp)',
                    borderBottom: '1px solid var(--rule)',
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5 mb-[18px]">
                <label className="text-[9px] font-bold uppercase tracking-[0.6px]" style={{ color: 'var(--tm)' }}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="bg-transparent border-0 pb-2.5 pt-2.5 text-[15px] outline-none transition-colors w-full"
                  style={{
                    color: 'var(--tp)',
                    borderBottom: '1px solid var(--rule)',
                  }}
                />
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-1.5 text-[12px] cursor-pointer" style={{ color: 'var(--ts)' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--acc)' }} />
                  Remember me
                </label>
                <a href="#" className="text-[12px] hover:underline" style={{ color: 'var(--bl)' }}>Forgot password?</a>
              </div>

              <button
                onClick={signIn}
                className="w-full py-3 text-[13px] font-bold tracking-[0.2px] rounded-clausule text-white transition-opacity hover:opacity-90 mb-5"
                style={{ background: 'var(--acc)' }}
              >
                Sign in
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
                <span className="text-[11px]" style={{ color: 'var(--tm)' }}>or</span>
                <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
              </div>

              <button
                onClick={signIn}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-sans font-bold rounded-clausule transition-colors bg-transparent mb-5"
                style={{ color: 'var(--ts)', border: '1px solid var(--rule)' }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/>
                  <rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>
                </svg>
                Continue with SSO
              </button>

              <p className="text-[11px] text-center" style={{ color: 'var(--tm)' }}>
                By signing in you agree to Acme Corp's internal data policy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
