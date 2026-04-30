'use client'

function classNames(...values) {
  return values.filter(Boolean).join(' ')
}

export default function PageShell({ children, mainClassName = '', innerClassName = '', ariaLabelledby }) {
  return (
    <main className={classNames('be-main', mainClassName)} aria-labelledby={ariaLabelledby}>
      <div className={classNames('be-inner', innerClassName)}>
        {children}
      </div>
    </main>
  )
}
