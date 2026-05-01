import { PlusIcon } from "@shared/components/ui/icon/PlusIcon"
import { ArrowIcon } from '@shared/components/ui/icon/ArrowIcon'
import { BoltIcon } from '@shared/components/ui/icon/BoltIcon'
import { AchievementOrbitIllustration } from '@shared/components/ui/icon/AchievementOrbitIllustration'
import { MessageIcon } from '@shared/components/ui/icon/MessageIcon'
import { TrophyIcon } from '@shared/components/ui/icon/TrophyIcon'

const PROMPTS = [
  {
    title: 'Log a recent win',
    hint: 'Something shipped, solved, or delivered',
    Icon: TrophyIcon,
  },
  {
    title: 'Capture feedback you received',
    hint: 'Praise from a manager, peer, or stakeholder',
    Icon: MessageIcon,
  },
  {
    title: 'Note a challenge you overcame',
    hint: 'A hard problem, a tough conversation, a comeback',
    Icon: BoltIcon,
  },
]

export default function BragEmptyState({ onAddEntry }) {
  const handleStart = (event) => {
    event.preventDefault()
    onAddEntry?.()
  }

  return (
    <section className="be-empty mx-auto flex max-w-[520px] flex-col items-center text-center" aria-labelledby="brag-empty-title">
      <div className="be-empty-hero mb-9 h-[200px] w-[200px]" aria-hidden="true">
        <AchievementOrbitIllustration />
      </div>

      <p className="be-empty-eyebrow mb-[14px] text-[11px] font-bold uppercase tracking-[2.5px] text-[var(--cl-accent-deep)]">Your brag doc awaits</p>
      <h2 id="brag-empty-title" className="be-empty-title [font-family:'DM_Serif_Display',Georgia,serif] text-[48px] leading-[1.05] tracking-[-1.5px] text-[var(--cl-surface-ink-2)] max-[640px]:text-[40px]">
        You&apos;ve done great things.<br />
        Start <em className="font-normal italic text-[var(--cl-accent-deep)]">writing them down.</em>
      </h2>
      <p className="be-empty-copy mt-5 max-w-[420px] text-[16px] leading-[1.65] text-[var(--cl-surface-muted-8)]">
        Your brag doc is a running record of wins, impact, and growth. It turns <strong>review season from stressful to confident.</strong>
      </p>

      <ul className="be-empty-prompts mt-11 grid w-full gap-[10px]" role="list" aria-label="Ways to start your brag doc">
        {PROMPTS.map((prompt) => (
          <li key={prompt.title} className="be-empty-prompt-item">
            <button type="button" className="be-empty-prompt relative flex w-full items-center gap-4 overflow-hidden rounded-[12px] border border-[var(--cl-ink-alpha-10)] bg-[var(--cl-surface-white)] px-5 py-4 text-left transition-[border-color,color,transform] duration-150 hover:border-[var(--cl-accent-alpha-30)] hover:[&_\.be-empty-prompt-arrow]:translate-x-[3px] hover:[&_\.be-empty-prompt-arrow]:text-[var(--cl-accent-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-accent)] before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:origin-left before:scale-x-0 before:bg-[var(--cl-accent-deep)] before:transition-transform before:duration-200 before:content-[''] hover:before:scale-x-100" aria-label={`${prompt.title} - ${prompt.hint}`} onClick={handleStart}>
              <span className="be-empty-prompt-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[var(--cl-accent-soft-10)] text-[var(--cl-accent-deep)]" aria-hidden="true">
                <prompt.Icon />
              </span>
              <span className="be-empty-prompt-text flex min-w-0 flex-1 flex-col">
                <span className="be-empty-prompt-title text-[14px] font-bold text-[var(--cl-surface-ink-2)]">{prompt.title}</span>
                <span className="be-empty-prompt-hint mt-0.5 text-[12px] text-[var(--cl-surface-muted-8)]">{prompt.hint}</span>
              </span>
              <span className="be-empty-prompt-arrow ml-auto flex shrink-0 items-center text-[var(--cl-surface-muted-12)] transition-[color,transform] duration-150 group-hover:text-[var(--cl-accent-deep)]" aria-hidden="true">
                <ArrowIcon />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="be-cta mt-9 inline-flex items-center gap-3 rounded-[10px] bg-[var(--cl-surface-ink-5)] px-8 py-4 text-[15px] font-bold text-[var(--cl-surface-warm)] transition-colors duration-150 hover:bg-[var(--cl-surface-ink-6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-accent)]" onClick={handleStart}>
        <span className="be-cta-icon flex h-7 w-7 items-center justify-center rounded-[7px] bg-[var(--cl-white-12)] text-[var(--cl-surface-warm)]" aria-hidden="true">
          <PlusIcon />
        </span>
        Add your first entry
      </button>
      <p className="be-empty-note mt-[14px] text-[12px] text-[var(--cl-surface-muted-10)]">Takes 30 seconds. Future-you will be grateful.</p>
    </section>
  )
}
