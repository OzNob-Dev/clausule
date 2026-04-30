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
    <section className="be-empty" aria-labelledby="brag-empty-title">
      <div className="be-empty-hero" aria-hidden="true">
        <AchievementOrbitIllustration />
      </div>

      <p className="be-empty-eyebrow">Your brag doc awaits</p>
      <h2 id="brag-empty-title" className="be-empty-title">
        You&apos;ve done great things.<br />
        Start <em>writing them down.</em>
      </h2>
      <p className="be-empty-copy">
        Your brag doc is a running record of wins, impact, and growth. It turns <strong>review season from stressful to confident.</strong>
      </p>

      <ul className="be-empty-prompts" role="list" aria-label="Ways to start your brag doc">
        {PROMPTS.map((prompt) => (
          <li key={prompt.title} className="be-empty-prompt-item">
            <button type="button" className="be-empty-prompt" aria-label={`${prompt.title} - ${prompt.hint}`} onClick={handleStart}>
              <span className="be-empty-prompt-icon" aria-hidden="true">
                <prompt.Icon />
              </span>
              <span className="be-empty-prompt-text">
                <span className="be-empty-prompt-title">{prompt.title}</span>
                <span className="be-empty-prompt-hint">{prompt.hint}</span>
              </span>
              <span className="be-empty-prompt-arrow" aria-hidden="true">
                <ArrowIcon />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="be-cta" onClick={handleStart}>
        <span className="be-cta-icon" aria-hidden="true">
          <PlusIcon />
        </span>
        Add your first entry
      </button>
      <p className="be-empty-note">Takes 30 seconds. Future-you will be grateful.</p>
    </section>
  )
}
