import '../../styles/thinking-dots.css'

export function ThinkingDots() {
  return (
    <span className="td-wrap">
      {[0, 1, 2].map((i) => (
        <span key={i} className="think-dot" />
      ))}
    </span>
  )
}
