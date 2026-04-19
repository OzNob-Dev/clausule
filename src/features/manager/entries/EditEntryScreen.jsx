'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@features/manager/components/AppShell'
import { DateCategoryFields, EntryTextFields, Field, NoteTypeButtons } from '@features/manager/entries/EntryFormFields'
import '@features/manager/styles/entry-form.css'

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

export default function EditEntry() {
  const router = useRouter()
  const [form, setForm] = useState(EXISTING)
  const [deleted, setDeleted] = useState(false)

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleDelete = () => {
    if (window.confirm('Delete this entry? This cannot be undone.')) {
      setDeleted(true)
      setTimeout(() => router.push('/profile'), 500)
    }
  }

  if (deleted) return null

  return (
    <AppShell>
      <div className="ef-page">
        <div className="ef-header">
          <button className="ef-back-btn" onClick={() => router.back()} aria-label="Go back">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="10 4 6 8 10 12"/>
            </svg>
          </button>
          <div className="ef-title">Edit file note</div>
        </div>
        <div className="ef-subtitle">
          Last edited {form.updatedAt} · Created {form.createdAt}
        </div>

        <div className="ef-divider" />

        {/* Employee — read-only */}
        <Field label="Employee">
          <div className="ef-input ef-input--readonly">{form.employee}</div>
        </Field>

        <DateCategoryFields form={form} onChange={set} />
        <NoteTypeButtons value={form.type} onChange={set} />
        <EntryTextFields form={form} onChange={set} />

        {/* Checks */}
        <div className="ef-checks">
          <label>
            <input type="checkbox" checked={form.confidential} onChange={(e) => set('confidential', e.target.checked)} />
            Confidential
          </label>
        </div>

        {/* Actions */}
        <div className="ef-actions">
          <button onClick={() => router.back()} className="ef-btn-save">
            Save changes
          </button>
          <button onClick={() => router.back()} className="ef-btn-cancel">
            Cancel
          </button>
          <button onClick={handleDelete} className="ef-btn-delete">
            Delete entry
          </button>
        </div>
      </div>
    </AppShell>
  )
}
