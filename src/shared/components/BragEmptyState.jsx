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
    <section className="be-empty mx-auto flex max-w-[760px] flex-col items-center text-center" aria-labelledby="brag-empty-title">
      <div className="be-empty-hero mb-6" aria-hidden="true">
        <AchievementOrbitIllustration />
      </div>

      <p className="be-empty-eyebrow mb-3 text-[var(--cl-text-xs)] font-bold uppercase tracking-[0.16em] text-[var(--cl-accent-deep)]">Your brag doc awaits</p>
      <h2 id="brag-empty-title" className="be-empty-title [font-family:'DM_Serif_Display',Georgia,serif] text-[clamp(2.6rem,6vw,4.5rem)] leading-[0.98] tracking-[-0.03em] text-[var(--cl-surface-ink-2)]">
        You&apos;ve done great things.<br />
        Start <em className="text-[var(--cl-accent-deep)]">writing them down.</em>
      </h2>
      <p className="be-empty-copy mt-4 max-w-[56ch] text-[var(--cl-text-lg)] leading-[1.7] text-[var(--cl-surface-muted-8)]">
        Your brag doc is a running record of wins, impact, and growth. It turns <strong>review season from stressful to confident.</strong>
      </p>

      <ul className="be-empty-prompts mt-8 grid w-full gap-3" role="list" aria-label="Ways to start your brag doc">
        {PROMPTS.map((prompt) => (
          <li key={prompt.title} className="be-empty-prompt-item">
            <button type="button" className="be-empty-prompt flex w-full items-center gap-4 rounded-[18px] border border-[var(--cl-ink-alpha-10)] bg-[var(--cl-surface-white)] px-5 py-4 text-left shadow-[0_12px_30px_rgba(26,18,12,0.05)] transition-transform duration-150 hover:-translate-y-0.5" aria-label={`${prompt.title} - ${prompt.hint}`} onClick={handleStart}>
              <span className="be-empty-prompt-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--cl-accent-soft-10)] text-[var(--cl-accent-deep)]" aria-hidden="true">
                <prompt.Icon />
              </span>
              <span className="be-empty-prompt-text flex min-w-0 flex-1 flex-col">
                <span className="be-empty-prompt-title text-[var(--cl-text-base)] font-bold text-[var(--cl-surface-ink-2)]">{prompt.title}</span>
                <span className="be-empty-prompt-hint mt-1 text-[var(--cl-text-sm)] leading-[1.5] text-[var(--cl-surface-muted-8)]">{prompt.hint}</span>
              </span>
              <span className="be-empty-prompt-arrow text-[var(--cl-accent-deep)]" aria-hidden="true">
                <ArrowIcon />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="be-cta mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--cl-accent-deep)] px-5 py-3 text-[var(--cl-text-base)] font-bold text-[var(--cl-surface-paper)] shadow-[0_16px_34px_var(--cl-accent-soft-21)] transition-transform duration-150 hover:-translate-y-0.5" onClick={handleStart}>
        <span className="be-cta-icon flex h-6 w-6 items-center justify-center rounded-md bg-[var(--cl-black-20)]" aria-hidden="true">
          <PlusIcon />
        </span>
        Add your first entry
      </button>
      <p className="be-empty-note mt-3 text-[var(--cl-text-sm)] text-[var(--cl-surface-muted-8)]">Takes 30 seconds. Future-you will be grateful.</p>
    </section>
  )
}
