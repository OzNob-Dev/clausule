'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { storage } from '@/utils/storage'
import { useAuth } from '@/contexts/AuthContext'
import '@/styles/settings.css'

const WINDOWS = ['30 days', '60 days', '90 days', '6 months']

const FLAGGED = [
  { name: "Marcus O'Brien", role: 'Engineer I', team: 'Platform', av: 'MO', avBg: 'rgba(240,149,149,0.14)', avCol: '#F09595', reason: '4 conduct notes + 2 escalations in 60d', days: 60, risk: 'High' },
  { name: 'Sophie Okafor',  role: 'Engineer II', team: 'Security', av: 'SO', avBg: 'rgba(240,149,149,0.14)', avCol: '#F09595', reason: '3 weeks at Needs work + 1 escalation', days: 21, risk: 'High' },
]

export default function Settings() {
  const { logout } = useAuth()
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [combined, setCombined] = useState(true)
  const [conductThreshold, setConductThreshold] = useState(3)
  const [escalationThreshold, setEscalationThreshold] = useState(2)
  const [needsWorkWeeks, setNeedsWorkWeeks] = useState(3)
  const [window, setWindow] = useState('60 days')
  const [actions, setActions] = useState({ notifyHR: true, flagRecord: true, notifyMgr: false, autoSummary: false })

  const toggleAction = (key) => setActions((a) => ({ ...a, [key]: !a[key] }))
  const confirmReady = deleteConfirmText === 'DELETE'

  return (
    <AppShell>
      <div className="st-page">
        <div className="st-content">

          <div className="st-title">Signal settings</div>
          <div className="st-subtitle">Configure when Clausule surfaces HR alerts.</div>

          <div className="st-divider" />

          {/* Threshold card */}
          <div className="st-card">
            <div className="st-card-head">
              <div>
                <div className="st-card-title">Alert thresholds</div>
                <div className="st-card-sub">Configure when Clausule surfaces an alert for an employee.</div>
              </div>
              <div className="st-toggle-row">
                <span>Combined</span>
                <div
                  onClick={() => setCombined((c) => !c)}
                  className={`st-toggle${combined ? ' st-toggle--on' : ''}`}
                  role="switch"
                  aria-checked={combined}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setCombined((c) => !c)}
                >
                  <div className={`st-toggle-knob${combined ? ' st-toggle-knob--on' : ''}`} />
                </div>
              </div>
            </div>

            {[
              { label: 'Conduct / performance notes', val: conductThreshold, set: setConductThreshold, min: 1, max: 10 },
              { label: 'Escalations', val: escalationThreshold, set: setEscalationThreshold, min: 1, max: 5 },
              { label: 'Weeks at Needs work', val: needsWorkWeeks, set: setNeedsWorkWeeks, min: 1, max: 12 },
            ].map(({ label, val, set, min, max }) => (
              <div key={label} className="st-slider-row">
                <div className="st-slider-label">{label}</div>
                <div className="st-slider-track">
                  <div
                    className="st-slider-fill"
                    style={{ width: `${((val - min) / (max - min)) * 100}%` }}
                  />
                  <input
                    type="range" min={min} max={max} value={val}
                    onChange={(e) => set(+e.target.value)}
                    className="st-slider-input"
                    aria-label={label}
                  />
                </div>
                <div className="st-slider-val">{val}</div>
              </div>
            ))}

            <div className="st-window-row">
              <div className="st-window-label">Time window</div>
              <div className="st-window-btns">
                {WINDOWS.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWindow(w)}
                    className={`st-window-btn${window === w ? ' st-window-btn--active' : ''}`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions card */}
          <div className="st-card">
            <div className="st-actions-title">When threshold is hit</div>
            <div className="st-actions-sub">
              Choose what happens automatically when an employee crosses a threshold.
            </div>
            {[
              { key: 'notifyHR',    label: 'Notify HR team',           sub: 'Sends an email to the HR distribution list' },
              { key: 'flagRecord',  label: 'Flag employee record',      sub: 'Adds a risk flag visible in the dashboard' },
              { key: 'notifyMgr',  label: 'Notify line manager',       sub: 'Sends a summary to the direct manager' },
              { key: 'autoSummary', label: 'Auto-generate HR summary', sub: 'Creates a draft summary for HR review' },
            ].map(({ key, label, sub }) => (
              <div key={key} className="st-action-item">
                <input
                  type="checkbox"
                  checked={actions[key]}
                  onChange={() => toggleAction(key)}
                  className="st-action-checkbox"
                  aria-label={label}
                />
                <div>
                  <div className="st-action-label">{label}</div>
                  <div className="st-action-sub">{sub}</div>
                </div>
              </div>
            ))}

            <div className="st-preview">
              <div className="st-preview-label">Preview notification</div>
              <div className="st-preview-text">
                An employee will be flagged after {conductThreshold} conduct/performance notes
                or {escalationThreshold} escalation{escalationThreshold !== 1 ? 's' : ''} within {window}.
              </div>
            </div>
          </div>

          {/* Currently flagged */}
          <div className="st-flagged-section">
            <div className="st-flagged-label">Currently flagged · {FLAGGED.length}</div>
            <div className="st-flagged-table">
              <div className="st-flagged-header">
                {['Employee', 'Reason', 'Days', 'Risk'].map((h) => (
                  <div key={h} className="st-flagged-hcell">{h}</div>
                ))}
              </div>
              {FLAGGED.map((f) => (
                <div key={f.name} className="st-flagged-row">
                  <div>
                    <div className="st-flagged-name">{f.name}</div>
                    <div className="st-flagged-role">{f.role} · {f.team}</div>
                  </div>
                  <div className="st-flagged-cell">{f.reason}</div>
                  <div className="st-flagged-cell">{f.days}d</div>
                  <div>
                    <span className="st-risk-badge">{f.risk}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="st-btn-save">Save settings</button>

          {/* Danger zone */}
          <div className="st-danger-section">
            <div className="st-danger-label">Danger zone</div>
            <div className="st-danger-card">
              <div className="st-danger-inner">
                <div>
                  <div className="st-danger-title">Delete account</div>
                  <div className="st-danger-desc">
                    Permanently remove your account and all associated data. This cannot be undone.
                  </div>
                </div>
                <button
                  onClick={() => { setDeleteConfirmText(''); setDeleteModal(true) }}
                  className="st-btn-delete-account"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete account modal */}
      {deleteModal && (
        <div
          className="st-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteModal(false) }}
        >
          <div className="st-modal">
            <div className="st-modal-icon">
              <svg viewBox="0 0 20 20" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round" style={{ width: 20, height: 20 }}>
                <polyline points="3 6 5 6 17 6" />
                <path d="M8 6V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" />
                <path d="M16 6l-1 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                <line x1="10" y1="11" x2="10" y2="15" />
                <line x1="8" y1="11" x2="8" y2="15" />
                <line x1="12" y1="11" x2="12" y2="15" />
              </svg>
            </div>

            <div className="st-modal-title">Delete your account?</div>
            <div className="st-modal-body">
              This will <strong>permanently delete</strong> your account and remove all associated data — including every entry, note, and file record — from our servers. This action <strong style={{ color: 'var(--red)' }}>cannot be undone</strong>.
            </div>

            <div className="st-modal-confirm">
              <label className="st-confirm-label">
                Type <span>DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                autoFocus
                className="st-confirm-input"
              />
            </div>

            <div className="st-modal-actions">
              <button
                disabled={!confirmReady}
                onClick={() => logout()}
                className={`st-btn-confirm${confirmReady ? ' st-btn-confirm--ready' : ''}`}
              >
                Yes, permanently delete my account
              </button>
              <button
                onClick={() => setDeleteModal(false)}
                className="st-btn-modal-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  )
}
