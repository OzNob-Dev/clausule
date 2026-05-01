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
    <section className="be-empty mx-auto flex max-w-[880px] flex-col items-center text-center" aria-labelledby="brag-empty-title">
      <div className="be-empty-hero mb-5 flex h-24 items-end justify-center" aria-hidden="true">
        <AchievementOrbitIllustration />
      </div>

      <p className="be-empty-eyebrow mb-4 text-[var(--cl-text-xs)] font-bold uppercase tracking-[0.22em] text-[var(--cl-surface-muted-6)]">Your brag doc awaits</p>
      <h2 id="brag-empty-title" className="be-empty-title max-w-[13ch] [font-family:'DM_Serif_Display',Georgia,serif] text-[clamp(3rem,6vw,5.3rem)] leading-[0.92] tracking-[-0.04em] text-[var(--cl-surface-ink-2)]">
        You&apos;ve done great things.<br />
        Start <em className="font-normal italic text-[var(--cl-accent)]">writing them down.</em>
      </h2>
      <p className="be-empty-copy mt-6 max-w-[45ch] text-[1.125rem] leading-[1.7] text-[var(--cl-surface-muted-3)]">
        Your brag doc is a running record of wins, impact, and growth. It turns <strong>review season from stressful to confident.</strong>
      </p>

      <ul className="be-empty-prompts mt-10 grid w-full gap-4" role="list" aria-label="Ways to start your brag doc">
        {PROMPTS.map((prompt) => (
          <li key={prompt.title} className="be-empty-prompt-item">
            <button type="button" className="be-empty-prompt flex w-full items-center gap-4 rounded-[24px] border border-[var(--cl-brown-alpha-12)] bg-[rgba(255,255,255,0.78)] px-6 py-5 text-left shadow-[0_18px_40px_rgba(37,29,21,0.08)] backdrop-blur-[6px] transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-[var(--cl-accent-alpha-24)] hover:shadow-[0_22px_44px_rgba(37,29,21,0.11)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cl-accent)]" aria-label={`${prompt.title} - ${prompt.hint}`} onClick={handleStart}>
              <span className="be-empty-prompt-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--cl-accent-alpha-15)] bg-[linear-gradient(180deg,var(--cl-surface-paper-2)_0%,var(--cl-accent-soft-10)_100%)] text-[var(--cl-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]" aria-hidden="true">
                <prompt.Icon />
              </span>
              <span className="be-empty-prompt-text flex min-w-0 flex-1 flex-col">
                <span className="be-empty-prompt-title text-[1.125rem] font-bold leading-[1.25] text-[var(--cl-surface-ink-2)]">{prompt.title}</span>
                <span className="be-empty-prompt-hint mt-1.5 text-[0.95rem] leading-[1.55] text-[var(--cl-surface-muted-4)]">{prompt.hint}</span>
              </span>
              <span className="be-empty-prompt-arrow flex h-10 w-10 items-center justify-center rounded-full bg-[var(--cl-accent-soft-10)] text-[var(--cl-accent)]" aria-hidden="true">
                <ArrowIcon />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="be-cta mt-10 inline-flex items-center gap-3 rounded-full bg-[var(--cl-surface-ink-2)] px-6 py-4 text-[1.05rem] font-bold text-[var(--cl-surface-paper)] shadow-[0_22px_44px_rgba(28,21,16,0.18)] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:bg-[var(--cl-surface-ink-3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cl-accent)]" onClick={handleStart}>
        <span className="be-cta-icon flex h-8 w-8 items-center justify-center rounded-full bg-[var(--cl-accent)] text-[var(--cl-surface-paper)]" aria-hidden="true">
          <PlusIcon />
        </span>
        Add your first entry
      </button>
      <p className="be-empty-note mt-4 text-[0.95rem] text-[var(--cl-surface-muted-5)]">Takes 30 seconds. Future-you will be grateful.</p>
    </section>
  )
}
