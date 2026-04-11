import { useState } from 'react'
import { AppShell } from '../components/layout/AppShell'

const WINDOWS = ['30 days', '60 days', '90 days', '6 months']

const FLAGGED = [
  { name: "Marcus O'Brien", role: 'Engineer I · Platform', av: 'MO', avBg: '#FCEBEB', avCol: '#A32D2D', reason: '4 conduct notes + 2 escalations in 60d' },
  { name: 'Sophie Okafor',  role: 'Engineer II · Security', av: 'SO', avBg: '#FCEBEB', avCol: '#A32D2D', reason: '3 weeks at Needs work + 1 escalation' },
]

function Slider({ label, value, min, max, onChange, hint }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-ts dark:text-[#9A9994]">{label}</span>
        <span className="text-[13px] font-medium text-tp dark:text-tp-dark tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-nav h-1 rounded-full"
      />
      {hint && <span className="text-[11px] text-tm">{hint}</span>}
    </div>
  )
}

export default function Settings() {
  const [combined, setCombined] = useState(true)
  const [conductThreshold, setConductThreshold] = useState(3)
  const [escalationThreshold, setEscalationThreshold] = useState(2)
  const [needsWorkWeeks, setNeedsWorkWeeks] = useState(3)
  const [window, setWindow] = useState('60 days')
  const [actions, setActions] = useState({ notifyHR: true, flagRecord: true, notifyMgr: false, autoSummary: false })

  const toggleAction = (key) => setActions((a) => ({ ...a, [key]: !a[key] }))

  return (
    <AppShell>
      <div className="px-8 py-8 max-w-xl">
        <div className="mb-6">
          <h1 className="text-[20px] font-medium text-tp dark:text-tp-dark mb-0.5">Signal settings</h1>
          <p className="text-[13px] text-tm dark:text-[#6B6B68]">Configure when Clausule surfaces HR alerts.</p>
        </div>

        {/* Combined toggle */}
        <div className="bg-card dark:bg-card-dark border border-[rgba(0,0,0,0.07)] rounded-clausule p-4 mb-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-[14px] font-medium text-tp dark:text-tp-dark">Combined signal threshold</div>
              <div className="text-[12px] text-tm mt-0.5">Use all signals together when evaluating risk</div>
            </div>
            <button
              onClick={() => setCombined((c) => !c)}
              className={`w-10 h-5 rounded-full transition-colors relative ${combined ? 'bg-nav' : 'bg-tc'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${combined ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
        </div>

        {/* Sliders */}
        <div className="bg-card dark:bg-card-dark border border-[rgba(0,0,0,0.07)] rounded-clausule p-5 mb-4 flex flex-col gap-5">
          <Slider
            label="Conduct / performance notes"
            value={conductThreshold}
            min={1} max={10}
            onChange={setConductThreshold}
            hint={`Flag when ≥ ${conductThreshold} conduct or performance notes in the time window`}
          />
          <div className="h-px bg-[rgba(0,0,0,0.06)]" />
          <Slider
            label="Escalations"
            value={escalationThreshold}
            min={1} max={5}
            onChange={setEscalationThreshold}
            hint={`Flag when ≥ ${escalationThreshold} escalation${escalationThreshold !== 1 ? 's' : ''} in the time window`}
          />
          <div className="h-px bg-[rgba(0,0,0,0.06)]" />
          <Slider
            label="Weeks at Needs work"
            value={needsWorkWeeks}
            min={1} max={12}
            onChange={setNeedsWorkWeeks}
            hint={`Flag after ${needsWorkWeeks} consecutive week${needsWorkWeeks !== 1 ? 's' : ''} at "Needs work" status`}
          />
        </div>

        {/* Time window */}
        <div className="bg-card dark:bg-card-dark border border-[rgba(0,0,0,0.07)] rounded-clausule p-4 mb-4">
          <div className="text-[12px] font-medium text-ts dark:text-[#9A9994] uppercase tracking-[0.4px] mb-3">Time window</div>
          <div className="flex gap-2 flex-wrap">
            {WINDOWS.map((w) => (
              <button
                key={w}
                onClick={() => setWindow(w)}
                className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors ${
                  window === w
                    ? 'bg-nav text-[#E8ECF8] border-nav'
                    : 'bg-transparent text-ts border-[rgba(0,0,0,0.09)] hover:border-[rgba(0,0,0,0.2)]'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-card dark:bg-card-dark border border-[rgba(0,0,0,0.07)] rounded-clausule p-4 mb-6">
          <div className="text-[12px] font-medium text-ts dark:text-[#9A9994] uppercase tracking-[0.4px] mb-3">When threshold is hit</div>
          <div className="flex flex-col gap-3">
            {[
              { key: 'notifyHR',    label: 'Notify HR team' },
              { key: 'flagRecord',  label: 'Flag employee record' },
              { key: 'notifyMgr',  label: 'Notify line manager' },
              { key: 'autoSummary', label: 'Auto-generate HR summary' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={actions[key]}
                  onChange={() => toggleAction(key)}
                  className="accent-nav"
                />
                <span className="text-[13px] text-ts dark:text-[#9A9994]">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Preview notification */}
        <div className="mb-6 px-4 py-3 bg-rb rounded-clausule text-[12px] text-rt flex items-start gap-2">
          <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6"/><line x1="8" y1="5" x2="8" y2="8.5"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/>
          </svg>
          <span>
            With current settings, an employee will be flagged after {conductThreshold} conduct/performance notes
            or {escalationThreshold} escalation{escalationThreshold !== 1 ? 's' : ''} within {window}.
          </span>
        </div>

        {/* Currently flagged */}
        <div>
          <div className="text-[12px] font-medium text-ts dark:text-[#9A9994] uppercase tracking-[0.4px] mb-3">
            Currently flagged · {FLAGGED.length}
          </div>
          <div className="flex flex-col gap-2.5">
            {FLAGGED.map((f) => (
              <div key={f.name} className="flex items-center gap-3 bg-card dark:bg-card-dark border border-[rgba(0,0,0,0.07)] rounded-clausule p-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0"
                  style={{ background: f.avBg, color: f.avCol }}
                >
                  {f.av}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-tp dark:text-tp-dark">{f.name}</div>
                  <div className="text-[11px] text-tm">{f.reason}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-rb text-rt rounded-full flex-shrink-0">Flagged</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
