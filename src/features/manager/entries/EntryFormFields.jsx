export const CATEGORIES = ['Performance', 'Conduct', 'Development']
export const NOTE_TYPES = ['Check-in', 'Note', 'Concern', 'Growth', 'Incident', 'Commendation']

export function Field({ label, children }) {
  return (
    <div className="ef-field">
      <div className="ef-field-label">{label}</div>
      {children}
    </div>
  )
}

export function DateCategoryFields({ form, onChange }) {
  return (
    <div className="ef-grid">
      <div>
        <div className="ef-field-label">Date</div>
        <input
          type="date"
          value={form.date}
          onChange={(e) => onChange('date', e.target.value)}
          className="ef-input"
        />
      </div>
      <div>
        <div className="ef-field-label">Category</div>
        <select
          value={form.category}
          onChange={(e) => onChange('category', e.target.value)}
          className="ef-input"
          style={{ appearance: 'none', cursor: 'pointer' }}
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
      <div className="ef-type-btns">
        {NOTE_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onChange('type', type)}
            className={`ef-type-btn${value === type ? ' ef-type-btn--active' : ''}`}
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
          className="ef-input"
        />
      </Field>

      <Field label="Details">
        <textarea
          value={form.details}
          onChange={(e) => onChange('details', e.target.value)}
          rows={6}
          placeholder={detailsPlaceholder}
          className="ef-input ef-input--textarea"
        />
      </Field>
    </>
  )
}
