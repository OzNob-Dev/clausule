const DELAY_CLASSES = [
  '',
  'motion-safe:[animation-delay:150ms]',
  'motion-safe:[animation-delay:300ms]',
]

export function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`inline-block h-2 w-2 rounded-full bg-tm motion-safe:animate-[think_1.2s_ease-in-out_infinite] ${DELAY_CLASSES[i]}`}
        />
      ))}
    </span>
  )
}
