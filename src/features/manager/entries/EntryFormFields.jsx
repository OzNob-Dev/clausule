import { cn } from '@shared/utils/cn'

export const CATEGORIES = ['Performance', 'Conduct', 'Development']
export const NOTE_TYPES = ['Check-in', 'Note', 'Concern', 'Growth', 'Incident', 'Commendation']
export const controlClass =
  'block box-border min-w-0 w-full rounded-[var(--r)] border-[1.5px] border-border2 bg-canvas px-[13px] py-[11px] text-sm font-medium text-tx-1 outline-none font-sans transition-colors duration-150 placeholder:text-tx-3 focus:border-acc-text'
export const areaClass = cn(controlClass, 'resize-y min-h-[140px] leading-[1.75]')

export function Field({ label, children }) {
  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold text-tx-4 uppercase tracking-[0.8px] mb-[7px]">{label}</div>
      {children}
    </div>
  )
}

export function DateCategoryFields({ form, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-5 max-sm:grid-cols-1">
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-tx-4 uppercase tracking-[0.8px] mb-[7px]">Date</div>
        <input
          type="date"
          value={form.date}
          onChange={(e) => onChange('date', e.target.value)}
          className={controlClass}
        />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-tx-4 uppercase tracking-[0.8px] mb-[7px]">Category</div>
        <select
          value={form.category}
          onChange={(e) => onChange('category', e.target.value)}
          className={`${controlClass} appearance-none cursor-pointer`}
        >
          {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </select>
      </div>
    </div>
  )
}

export function NoteTypeButtons({ value, onChange }) {
  return (
    <Field label="Note type">
      <div className="flex flex-wrap gap-2">
        {NOTE_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onChange('type', type)}
            className={cn(
              "py-[5px] px-3 rounded-full text-[11px] font-bold font-sans cursor-pointer border-[1.5px] transition-all duration-150",
              value === type ? "bg-acc-bg border-acc-border text-acc-text" : "border-border2 bg-transparent text-tx-3"
            )}
          >
            {type}
          </button>
        ))}
      </div>
    </Field>
  )
}

export function EntryTextFields({ form, onChange, titlePlaceholder, detailsPlaceholder }) {
  return (
    <>
      <Field label="Title">
        <input
          type="text"
          value={form.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder={titlePlaceholder}
          className={controlClass}
        />
      </Field>

      <Field label="Details">
        <textarea
          value={form.details}
          onChange={(e) => onChange('details', e.target.value)}
          rows={6}
          placeholder={detailsPlaceholder}
          className={areaClass}
        />
      </Field>
    </>
  )
}
