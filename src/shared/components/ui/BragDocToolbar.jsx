import { Button } from './Button'
import { PlusIcon } from '@shared/components/ui/icon/PlusIcon'
export default function BragDocToolbar({ activeYear, entryCount = 0, years = [], onAddEntry, onYearSelect }) {
  const yearTabs = [...years, 'All']

  return (
    <div className="be-doc-toolbar mx-[-32px] mb-9 flex flex-nowrap items-center gap-4 overflow-x-auto border-b border-[var(--cl-ink-alpha-12)] bg-[var(--cl-surface-muted-21)] px-8 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[768px]:mx-[-20px] max-[768px]:px-5">
      <Button type="button" variant="primary" className="be-doc-add-button flex h-[52px] min-w-0 flex-[0_0_320px] items-center justify-start gap-3 rounded-lg bg-[var(--cl-accent-deep)] px-5 text-left text-[var(--cl-surface-paper)] shadow-none hover:bg-[var(--cl-accent-deeper)]" onClick={onAddEntry}>
        <span className="be-doc-add-icon flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[5px] bg-[var(--cl-black-20)] [&_svg]:h-[13px] [&_svg]:w-[13px] [&_svg]:stroke-[var(--cl-surface-paper)] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&_svg]:[stroke-width:2.5]" aria-hidden="true">
          <PlusIcon />
        </span>
        <span className="be-doc-add-copy flex min-w-0 flex-col gap-0.5">
          <span className="be-doc-add-label text-[var(--cl-text-md)] font-bold leading-[1.2]">Add a win</span>
          <span className="be-doc-add-description text-[var(--cl-text-xs)] leading-[1.3] text-[var(--cl-paper-alpha-75)]">Capture a fresh entry for your brag doc</span>
        </span>
      </Button>

      <section className="be-doc-year-nav flex h-[52px] flex-[0_0_auto] items-stretch overflow-hidden rounded-lg border-[1.5px] border-[var(--cl-surface-ink-2)] bg-[var(--cl-surface-ink-2)]" aria-label="Year navigation">
        <span className="be-doc-year-nav-label flex items-center whitespace-nowrap bg-[var(--cl-surface-ink-2)] px-3.5 text-[var(--cl-text-2xs)] font-bold uppercase tracking-[1.8px] text-[var(--cl-surface-muted-16)]">Year</span>
        <div className="be-doc-year-nav-tabs flex min-w-0 overflow-x-auto bg-[var(--cl-surface-muted-16)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Choose a year">
          {yearTabs.map((year) => (
            <button
              key={year}
              type="button"
              className={`be-doc-year-tab min-w-[72px] border-r border-r-[var(--cl-ink-alpha-15)] px-[18px] text-[var(--cl-text-md)] ${activeYear === year ? 'be-doc-year-tab--active bg-[var(--cl-surface-ink-2)] font-bold text-[var(--cl-surface-muted-16)]' : 'bg-transparent font-medium text-[var(--cl-surface-ink-2)] hover:bg-[var(--cl-surface-muted-13)]'} last:border-r-0 focus-visible:outline-[2px] focus-visible:outline-[var(--cl-accent-deep)] focus-visible:outline-offset-[-2px]`}
              aria-pressed={activeYear === year}
              aria-controls={year === 'All' ? undefined : `be-doc-year-${year}`}
              onClick={() => onYearSelect(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </section>

      <div className="be-doc-entry-count ml-auto text-right text-[var(--cl-text-md)] font-medium leading-[1.2] text-[var(--cl-muted)]" aria-label="Entry count">
        <strong className="block [font-family:'DM_Serif_Display',Georgia,serif] text-[22px] font-normal leading-none text-[var(--cl-surface-ink-2)]">{entryCount}</strong>
        {entryCount === 1 ? 'entry' : 'entries'}
      </div>
    </div>
  )
}
