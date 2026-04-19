'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@shared/components/layout/AppShell'
import { DateCategoryFields, EntryTextFields, Field, NoteTypeButtons } from '@features/manager/entries/EntryFormFields'
import '@features/manager/styles/entry-form.css'

const EMPLOYEES = ['Jordan Ellis', 'Sara Chen', "Marcus O'Brien", 'Priya Lal', 'Tom Walsh', 'Riya Nair']

export default function NewEntry() {
  const router = useRouter()
  const [form, setForm] = useState({
    employee: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Performance',
    type: 'Note',
    title: '',
    details: '',
    confidential: false,
    notify: false,
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const handleSave = () => router.push('/dashboard')

  return (
    <AppShell>
      <div className="ef-page">
        <div className="ef-header">
          <button className="ef-back-btn" onClick={() => router.back()} aria-label="Go back">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="10 4 6 8 10 12"/>
            </svg>
          </button>
          <div className="ef-title">New file note</div>
        </div>
        <div className="ef-subtitle">Document this interaction clearly and factually.</div>

        <div className="ef-divider" />

        {/* Employee */}
        <Field label="Employee">
          <select
            value={form.employee}
            onChange={(e) => set('employee', e.target.value)}
            className="ef-input"
            style={{ appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">Select employee…</option>
            {EMPLOYEES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </Field>

        <DateCategoryFields form={form} onChange={set} />
        <NoteTypeButtons value={form.type} onChange={set} />
        <EntryTextFields
          form={form}
          onChange={set}
          titlePlaceholder="What is this entry about?"
          detailsPlaceholder="What was discussed, agreed, or observed. Write plainly."
        />

        {/* Checks */}
        <div className="ef-checks">
          <label>
            <input type="checkbox" checked={form.confidential} onChange={(e) => set('confidential', e.target.checked)} />
            Confidential
          </label>
          <label>
            <input type="checkbox" checked={form.notify} onChange={(e) => set('notify', e.target.checked)} />
            Notify HR
          </label>
        </div>

        {(!form.employee || !form.title) && (
          <p className="ef-required-msg">Employee and title are required.</p>
        )}

        {/* Actions */}
        <div className="ef-actions">
          <button
            onClick={handleSave}
            disabled={!form.employee || !form.title}
            className="ef-btn-save"
          >
            Save entry
          </button>
          <button onClick={() => router.back()} className="ef-btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </AppShell>
  )
}
