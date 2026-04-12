import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'

const CATEGORIES = ['Performance', 'Conduct', 'Development']
const NOTE_TYPES = ['Check-in', 'Note', 'Concern', 'Growth', 'Incident', 'Commendation']

const EXISTING = {
  employee: 'Jordan Ellis',
  date: '2025-09-15',
  category: 'Performance',
  type: 'Check-in',
  title: 'Q3 performance check-in',
  details: 'Strong delivery on the authentication refactor. Took initiative on the API design without being asked. Code review quality has improved noticeably.',
  confidential: false,
  createdAt: '2025-09-15',
  updatedAt: '2025-09-15',
}

const FIELD_INPUT = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid var(--border2)',
  borderRadius: 'var(--r)',
  padding: '11px 13px',
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--tx-1)',
  outline: 'none',
  fontFamily: 'var(--font)',
  transition: 'border-color 0.15s',
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '7px' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function focusBorder(e) { e.target.style.borderColor = 'var(--acc-text)' }
function blurBorder(e)  { e.target.style.borderColor = 'var(--border2)' }

export default function EditEntry() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EXISTING)
  const [deleted, setDeleted] = useState(false)

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleDelete = () => {
    if (window.confirm('Delete this entry? This cannot be undone.')) {
      setDeleted(true)
      setTimeout(() => navigate('/profile'), 500)
    }
  }

  if (deleted) return null

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto" style={{ padding: '40px 32px 100px', maxWidth: '640px', margin: '0 auto' }}>
        <div className="flex items-center gap-3 mb-1.5">
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--tx-3)', padding: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--tx-1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--tx-3)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="10 4 6 8 10 12"/>
            </svg>
          </button>
          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--tx-1)', letterSpacing: '-0.6px' }}>Edit file note</div>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--tx-3)', marginBottom: '28px' }}>
          Last edited {form.updatedAt} · Created {form.createdAt}
        </div>

        <div className="h-px mb-6" style={{ background: 'var(--border)' }} />

        {/* Employee — read-only */}
        <Field label="Employee">
          <div style={{
            ...FIELD_INPUT,
            background: 'rgba(255,255,255,0.03)',
            border: '1.5px solid var(--border)',
            color: 'var(--tx-2)',
            cursor: 'default',
          }}>
            {form.employee}
          </div>
        </Field>

        {/* Date + Category */}
        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '7px' }}>Date</div>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              style={FIELD_INPUT}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '7px' }}>Category</div>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              style={{ ...FIELD_INPUT, appearance: 'none', cursor: 'pointer' }}
              onFocus={focusBorder}
              onBlur={blurBorder}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Note type */}
        <Field label="Note type">
          <div className="flex flex-wrap gap-2">
            {NOTE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => set('type', t)}
                className="transition-all duration-150"
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font)',
                  cursor: 'pointer',
                  border: '1.5px solid',
                  ...(form.type === t
                    ? { background: 'var(--acc-bg)', borderColor: 'var(--acc-border)', color: 'var(--acc-text)' }
                    : { background: 'transparent', borderColor: 'var(--border2)', color: 'var(--tx-3)' }
                  ),
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        {/* Title */}
        <Field label="Title">
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            style={FIELD_INPUT}
            onFocus={focusBorder}
            onBlur={blurBorder}
          />
        </Field>

        {/* Details */}
        <Field label="Details">
          <textarea
            value={form.details}
            onChange={(e) => set('details', e.target.value)}
            rows={6}
            style={{ ...FIELD_INPUT, resize: 'vertical', minHeight: '140px', lineHeight: 1.75 }}
            onFocus={focusBorder}
            onBlur={blurBorder}
          />
        </Field>

        {/* Checks */}
        <div className="flex gap-4 mb-6" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--tx-3)' }}>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={form.confidential} onChange={(e) => set('confidential', e.target.checked)} style={{ accentColor: 'var(--acc)' }} />
            Confidential
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'var(--acc)',
              color: 'var(--tx-1)',
              border: 'none',
              borderRadius: 'var(--r)',
              fontSize: '13px',
              fontWeight: 700,
              padding: '11px 24px',
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              transition: 'opacity 0.15s',
            }}
          >
            Save changes
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tx-3)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="ml-auto"
            style={{ fontSize: '13px', fontWeight: 600, color: 'var(--red)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
          >
            Delete entry
          </button>
        </div>
      </div>
    </AppShell>
  )
}
