'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@features/manager/components/AppShell'
import { DateCategoryFields, EntryTextFields, Field, NoteTypeButtons } from '@features/manager/entries/EntryFormFields'

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
      <div className="flex-1 overflow-y-auto pt-10 px-8 pb-[100px] max-w-[640px] mx-auto max-sm:py-6 max-sm:px-4 max-sm:pb-[80px]">
        <div className="flex items-center gap-3 mb-1.5">
          <button className="bg-transparent border-none cursor-pointer text-tx-3 p-0 flex items-center transition-colors duration-150 hover:text-tx-1 [&>svg]:w-4 [&>svg]:h-4" onClick={() => router.back()} aria-label="Go back">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="10 4 6 8 10 12"/>
            </svg>
          </button>
          <div className="text-[22px] font-black text-tx-1 tracking-[-0.6px]">Edit file note</div>
        </div>
        <div className="text-[13px] text-tx-3 mb-7">
          Last edited {form.updatedAt} · Created {form.createdAt}
        </div>

        <div className="h-[1px] bg-border mb-6" />

        {/* Employee — read-only */}
        <Field label="Employee">
          <div className="w-full py-[11px] px-[13px] text-sm font-medium outline-none font-sans rounded-[var(--r)] border-[1.5px] bg-[rgba(60,45,35,0.03)] border-border text-tx-2 cursor-default">{form.employee}</div>
        </Field>

        <DateCategoryFields form={form} onChange={set} />
        <NoteTypeButtons value={form.type} onChange={set} />
        <EntryTextFields form={form} onChange={set} />

        {/* Checks */}
        <div className="flex gap-4 mb-6 text-[11px] font-semibold text-tx-3 [&_label]:flex [&_label]:items-center [&_label]:gap-1.5 [&_label]:cursor-pointer [&_input]:accent-acc">
          <label>
            <input type="checkbox" checked={form.confidential} onChange={(e) => set('confidential', e.target.checked)} />
            Confidential
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="bg-acc text-[#FAF7F3] border-none rounded-[var(--r)] text-[13px] font-bold py-[11px] px-6 cursor-pointer font-sans transition-opacity duration-150 hover:opacity-90 disabled:opacity-40 disabled:cursor-default">
            Save changes
          </button>
          <button onClick={() => router.back()} className="text-[13px] font-semibold text-tx-3 bg-transparent border-none cursor-pointer font-sans">
            Cancel
          </button>
          <button onClick={handleDelete} className="text-[13px] font-semibold text-red bg-transparent border-none cursor-pointer font-sans ml-auto">
            Delete entry
          </button>
        </div>
      </div>
    </AppShell>
  )
}
