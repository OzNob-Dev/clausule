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
    <div className="min-h-screen flex items-center justify-center p-6 bg-canvas dark:bg-canvas-dark transition-colors duration-200">
      <div
        className="flex w-[840px] max-w-full border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.08)] rounded-[10px] overflow-hidden"
      >
        {/* Left panel */}
        <div
          className="w-[300px] flex-shrink-0 flex flex-col justify-between p-[36px_30px]"
          style={{ background: '#1C2540' }}
        >
          <div className="text-[10px] font-medium tracking-[5px] text-[#EDEAE5] uppercase select-none">
            CLAU<span className="text-accent">SULE</span>
          </div>
          <div>
            <h1 className="font-serif text-[28px] font-normal text-[#EDEAE5] leading-tight tracking-[-0.4px] mb-3">
              Thoughtful records.<br />Better conversations.
            </h1>
            <p className="font-serif text-[14px] font-light italic text-[rgba(237,234,229,0.52)] leading-[1.75]">
              The file note tool built for managers who care about their people — and a brag doc for the people themselves.
            </p>
          </div>
          <div className="text-[11px] text-[rgba(237,234,229,0.22)]">
            Internal use only · Acme Corp
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-canvas dark:bg-canvas-dark p-[44px_40px] flex flex-col justify-center relative transition-colors duration-200">
          <button
            onClick={() => setDark((d) => !d)}
            className="absolute top-4 right-4 w-[30px] h-[30px] flex items-center justify-center rounded-full border border-[rgba(0,0,0,0.09)] dark:border-[rgba(255,255,255,0.08)] text-tm hover:text-ts transition-colors bg-transparent"
          >
            <MoonIcon />
          </button>

          {/* Step 1: Role selector */}
          {step === 'role' && (
            <div className="flex flex-col">
              <h2 className="font-serif text-[26px] font-normal text-tp dark:text-tp-dark tracking-[-0.4px] mb-1">
                Welcome back
              </h2>
              <p className="text-[13px] text-tm dark:text-[#6B6B68] mb-7">
                How are you signing in today?
              </p>

              <div className="flex flex-col gap-2.5 mb-6">
                {/* Manager card */}
                <button
                  onClick={() => setRole('manager')}
                  className={`flex items-center gap-4 p-[16px_18px] border-[1.5px] rounded-lg cursor-pointer transition-all text-left ${
                    role === 'manager'
                      ? 'border-nav bg-[rgba(28,37,64,0.04)]'
                      : 'border-[rgba(0,0,0,0.09)] hover:bg-[rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center bg-[#E8ECF8] text-nav flex-shrink-0">
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2" width="12" height="12" rx="1"/>
                      <line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="8" y2="11"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-tp dark:text-tp-dark">Manager / HR</div>
                    <div className="text-[12px] text-tm dark:text-[#6B6B68] mt-0.5">Access file notes, dashboards, and team records</div>
                  </div>
                  <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
                    role === 'manager' ? 'border-transparent bg-nav' : 'border-[rgba(0,0,0,0.09)]'
                  }`}>
                    {role === 'manager' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>

                {/* Employee card */}
                <button
                  onClick={() => setRole('employee')}
                  className={`flex items-center gap-4 p-[16px_18px] border-[1.5px] rounded-lg cursor-pointer transition-all text-left ${
                    role === 'employee'
                      ? 'border-[#534AB7] bg-[rgba(83,74,183,0.04)]'
                      : 'border-[rgba(0,0,0,0.09)] hover:bg-[rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center bg-[#EEEDFE] text-[#534AB7] flex-shrink-0">
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-tp dark:text-tp-dark">Employee</div>
                    <div className="text-[12px] text-tm dark:text-[#6B6B68] mt-0.5">View and add to your brag doc</div>
                  </div>
                  <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
                    role === 'employee' ? 'border-transparent bg-[#534AB7]' : 'border-[rgba(0,0,0,0.09)]'
                  }`}>
                    {role === 'employee' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              </div>

              <button
                onClick={goToCreds}
                className={`w-full py-3 text-[13px] font-medium tracking-[0.2px] rounded-clausule text-[#E8ECF8] transition-opacity hover:opacity-90 ${
                  isEmp ? 'bg-[#534AB7]' : 'bg-nav'
                }`}
              >
                Continue
              </button>
              <p className="text-[11px] text-tm dark:text-[#6B6B68] text-center mt-4">
                By signing in you agree to Acme Corp's internal data policy.
              </p>
            </div>
          )}

          {/* Step 2: Credentials */}
          {step === 'creds' && (
            <div className="flex flex-col">
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-[12px] text-tm hover:text-ts transition-colors mb-6 bg-transparent border-0 p-0 cursor-pointer font-sans"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="10 4 6 8 10 12"/>
                </svg>
                Back
              </button>

              <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-md mb-6 text-[13px] ${
                isEmp ? 'bg-[#EEEDFE] text-[#3C3489]' : 'bg-[#E8ECF8] text-nav'
              }`}>
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
                <span>Signing in as {isEmp ? 'Employee' : 'Manager / HR'}</span>
              </div>

              <div className="flex flex-col gap-1.5 mb-[18px]">
                <label className="text-[9px] font-medium text-tm uppercase tracking-[0.6px]">Work email</label>
                <input
                  type="email"
                  placeholder="you@acmecorp.com"
                  autoFocus
                  className="bg-white border-0 border-b border-[rgba(0,0,0,0.1)] pb-2.5 pt-2.5 text-[16px] font-serif font-light text-[#1A1F2B] outline-none focus:border-bl transition-colors w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5 mb-[18px]">
                <label className="text-[9px] font-medium text-tm uppercase tracking-[0.6px]">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="bg-white border-0 border-b border-[rgba(0,0,0,0.1)] pb-2.5 pt-2.5 text-[16px] font-serif font-light text-[#1A1F2B] outline-none focus:border-bl transition-colors w-full"
                />
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-1.5 text-[12px] text-ts cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-bl" />
                  Remember me
                </label>
                <a href="#" className="text-[12px] text-bl hover:underline">Forgot password?</a>
              </div>

              <button
                onClick={signIn}
                className={`w-full py-3 text-[13px] font-medium tracking-[0.2px] rounded-clausule text-[#E8ECF8] transition-opacity hover:opacity-90 mb-5 ${
                  isEmp ? 'bg-[#534AB7]' : 'bg-nav'
                }`}
              >
                Sign in
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[rgba(0,0,0,0.09)]" />
                <span className="text-[11px] text-tm">or</span>
                <div className="flex-1 h-px bg-[rgba(0,0,0,0.09)]" />
              </div>

              <button
                onClick={signIn}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-sans text-ts border border-[rgba(0,0,0,0.09)] rounded-clausule hover:bg-[rgba(0,0,0,0.02)] transition-colors bg-transparent mb-5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/>
                  <rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>
                </svg>
                Continue with SSO
              </button>

              <p className="text-[11px] text-tm dark:text-[#6B6B68] text-center">
                By signing in you agree to Acme Corp's internal data policy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
