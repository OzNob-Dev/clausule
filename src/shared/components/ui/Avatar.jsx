import '../../styles/avatar.css'

export function Avatar({ initials, bg, color, size = 'md', className = '' }) {
  return (
    <div
      className={`av av--${size}${className ? ` ${className}` : ''}`}
      style={{ '--av-bg': bg, '--av-color': color }}
    >
      {initials}
    </div>
  )
}
