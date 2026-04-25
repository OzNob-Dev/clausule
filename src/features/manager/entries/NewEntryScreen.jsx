'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@features/manager/components/AppShell'
import { DateCategoryFields, EntryTextFields, Field, NoteTypeButtons, controlClass } from '@features/manager/entries/EntryFormFields'
import { ALL_EMP } from '@shared/data/employees'

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
      <div className="flex-1 overflow-y-auto pt-10 px-8 pb-[100px] max-w-[640px] mx-auto max-sm:py-6 max-sm:px-4 max-sm:pb-[80px]">
        <div className="flex items-center gap-3 mb-1.5">
          <button className="bg-transparent border-none cursor-pointer text-tx-3 p-0 flex items-center transition-colors duration-150 hover:text-tx-1 [&>svg]:w-4 [&>svg]:h-4" onClick={() => router.back()} aria-label="Go back">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="10 4 6 8 10 12"/>
            </svg>
          </button>
          <div className="text-[22px] font-black text-tx-1 tracking-[-0.6px]">New file note</div>
        </div>
        <div className="text-[13px] text-tx-3 mb-7">Document this interaction clearly and factually.</div>

        <div className="h-[1px] bg-border mb-6" />

        {/* Employee */}
        <Field label="Employee" htmlFor="ne-employee">
          <select
            id="ne-employee"
            value={form.employee}
            onChange={(e) => set('employee', e.target.value)}
            className={`${controlClass} appearance-none cursor-pointer`}
          >
            <option value="">Select employee…</option>
            {ALL_EMP.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
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
        <div className="flex gap-4 mb-6 text-[11px] font-semibold text-tx-3 [&_label]:flex [&_label]:items-center [&_label]:gap-1.5 [&_label]:cursor-pointer [&_input]:accent-acc">
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
          <p className="text-[11px] text-tx-3 mb-4">Employee and title are required.</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!form.employee || !form.title}
            className="bg-acc text-[#FAF7F3] border-none rounded-[var(--r)] text-[13px] font-bold py-[11px] px-6 cursor-pointer font-sans transition-opacity duration-150 hover:opacity-90 disabled:opacity-40 disabled:cursor-default"
          >
            Save entry
          </button>
          <button onClick={() => router.back()} className="text-[13px] font-semibold text-tx-3 bg-transparent border-none cursor-pointer font-sans">
            Cancel
          </button>
        </div>
      </div>
    </AppShell>
  )
}
