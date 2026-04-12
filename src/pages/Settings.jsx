import { useState } from 'react'
import { AppShell } from '../components/layout/AppShell'

const WINDOWS = ['30 days', '60 days', '90 days', '6 months']

const FLAGGED = [
  { name: "Marcus O'Brien", role: 'Engineer I', team: 'Platform', av: 'MO', avBg: 'rgba(240,149,149,0.14)', avCol: '#F09595', reason: '4 conduct notes + 2 escalations in 60d', days: 60, risk: 'High' },
  { name: 'Sophie Okafor',  role: 'Engineer II', team: 'Security', av: 'SO', avBg: 'rgba(240,149,149,0.14)', avCol: '#F09595', reason: '3 weeks at Needs work + 1 escalation', days: 21, risk: 'High' },
]

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
      <div className="flex-1 overflow-y-auto">
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 32px 100px' }}>

          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--tx-1)', letterSpacing: '-0.6px', marginBottom: '6px' }}>
            Signal settings
          </div>
          <div style={{ fontSize: '13px', color: 'var(--tx-3)', marginBottom: '28px' }}>
            Configure when Clausule surfaces HR alerts.
          </div>

          <div className="h-px mb-6" style={{ background: 'var(--border)' }} />

          {/* Threshold card */}
          <div
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '22px 24px', marginBottom: '16px' }}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx-1)' }}>Alert thresholds</div>
                <div style={{ fontSize: '12px', color: 'var(--tx-3)', marginTop: '3px', lineHeight: 1.55 }}>
                  Configure when Clausule surfaces an alert for an employee.
                </div>
              </div>
              {/* Combined toggle */}
              <div className="flex items-center gap-2 flex-shrink-0" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx-3)' }}>
                <span>Combined</span>
                <div
                  onClick={() => setCombined((c) => !c)}
                  className="relative cursor-pointer flex-shrink-0"
                  style={{
                    width: '36px', height: '20px', borderRadius: '20px',
                    background: combined ? 'var(--acc)' : 'rgba(255,255,255,0.14)',
                    transition: 'background 0.15s',
                  }}
                >
                  <div
                    style={{
                      width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: '2px',
                      right: combined ? '2px' : '18px',
                      transition: 'right 0.15s',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sliders */}
            {[
              { label: 'Conduct / performance notes', val: conductThreshold, set: setConductThreshold, min: 1, max: 10 },
              { label: 'Escalations', val: escalationThreshold, set: setEscalationThreshold, min: 1, max: 5 },
              { label: 'Weeks at Needs work', val: needsWorkWeeks, set: setNeedsWorkWeeks, min: 1, max: 12 },
            ].map(({ label, val, set, min, max }) => (
              <div key={label} className="flex items-center gap-3.5 mb-3.5 last:mb-0">
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx-2)', minWidth: '180px' }}>{label}</div>
                <div className="relative flex-1" style={{ height: '4px', background: 'var(--border2)', borderRadius: '2px' }}>
                  <div
                    style={{
                      position: 'absolute', left: 0, top: 0, height: '4px',
                      borderRadius: '2px', background: 'var(--acc-text)',
                      width: `${((val - min) / (max - min)) * 100}%`,
                    }}
                  />
                  <input
                    type="range" min={min} max={max} value={val}
                    onChange={(e) => set(+e.target.value)}
                    style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', cursor: 'pointer', margin: 0 }}
                  />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--tx-1)', minWidth: '28px', textAlign: 'right' }}>{val}</div>
              </div>
            ))}

            {/* Time window */}
            <div className="flex items-center gap-2.5 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx-3)' }}>Time window</div>
              <div className="flex gap-1.5">
                {WINDOWS.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWindow(w)}
                    className="transition-all duration-150"
                    style={{
                      fontSize: '11px', fontWeight: 700, padding: '4px 12px',
                      borderRadius: '20px',
                      border: '1.5px solid var(--border2)',
                      fontFamily: 'var(--font)', cursor: 'pointer',
                      ...(window === w
                        ? { background: 'var(--tx-1)', color: 'var(--bg-doc)', borderColor: 'var(--tx-1)' }
                        : { background: 'transparent', color: 'var(--tx-3)' }
                      ),
                    }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions card */}
          <div
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '22px 24px', marginBottom: '16px' }}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx-1)', marginBottom: '6px' }}>When threshold is hit</div>
            <div style={{ fontSize: '12px', color: 'var(--tx-3)', lineHeight: 1.6, marginBottom: '16px' }}>
              Choose what happens automatically when an employee crosses a threshold.
            </div>
            {[
              { key: 'notifyHR',    label: 'Notify HR team',             sub: 'Sends an email to the HR distribution list' },
              { key: 'flagRecord',  label: 'Flag employee record',        sub: 'Adds a risk flag visible in the dashboard' },
              { key: 'notifyMgr',  label: 'Notify line manager',         sub: 'Sends a summary to the direct manager' },
              { key: 'autoSummary', label: 'Auto-generate HR summary',   sub: 'Creates a draft summary for HR review' },
            ].map(({ key, label, sub }) => (
              <div key={key} className="flex items-start gap-2.5 mb-3 last:mb-0">
                <input
                  type="checkbox"
                  checked={actions[key]}
                  onChange={() => toggleAction(key)}
                  style={{ accentColor: 'var(--acc)', width: '14px', height: '14px', marginTop: '2px', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tx-1)' }}>{label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--tx-3)', marginTop: '2px' }}>{sub}</div>
                </div>
              </div>
            ))}

            {/* Notification preview */}
            <div style={{ background: 'rgba(239,159,39,0.08)', border: '1px solid rgba(239,159,39,0.2)', borderRadius: 'var(--r)', padding: '12px 15px', marginTop: '16px' }}>
              <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--amber)', marginBottom: '7px' }}>
                Preview notification
              </div>
              <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--tx-2)', lineHeight: 1.7 }}>
                An employee will be flagged after {conductThreshold} conduct/performance notes
                or {escalationThreshold} escalation{escalationThreshold !== 1 ? 's' : ''} within {window}.
              </div>
            </div>
          </div>

          {/* Currently flagged — table */}
          <div style={{ marginTop: '28px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--tx-3)', marginBottom: '14px' }}>
              Currently flagged · {FLAGGED.length}
            </div>
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden' }}>
              {/* Header */}
              <div
                className="grid"
                style={{ gridTemplateColumns: '1fr 120px 90px 80px', padding: '10px 20px', borderBottom: '1px solid var(--border)' }}
              >
                {['Employee', 'Reason', 'Days', 'Risk'].map((h) => (
                  <div key={h} style={{ fontSize: '10px', fontWeight: 700, color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
                ))}
              </div>
              {/* Rows */}
              {FLAGGED.map((f, i) => (
                <div
                  key={f.name}
                  className="grid items-center"
                  style={{
                    gridTemplateColumns: '1fr 120px 90px 80px',
                    padding: '14px 20px',
                    borderBottom: i < FLAGGED.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx-1)' }}>{f.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--tx-3)', marginTop: '2px' }}>{f.role} · {f.team}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--tx-2)' }}>{f.reason}</div>
                  <div style={{ fontSize: '12px', color: 'var(--tx-2)' }}>{f.days}d</div>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 9px', borderRadius: '20px', background: 'var(--red-bg)', color: 'var(--red)' }}>
                      {f.risk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <button
            style={{
              marginTop: '20px',
              background: 'var(--tx-1)',
              color: 'var(--bg-doc)',
              border: 'none',
              borderRadius: 'var(--r)',
              fontSize: '12px',
              fontWeight: 700,
              padding: '10px 22px',
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              transition: 'opacity 0.15s',
            }}
          >
            Save settings
          </button>
        </div>
      </div>
    </AppShell>
  )
}
