'use client'

import { AppShell } from '@features/manager/components/AppShell'
import { relativeTime } from '@shared/utils/relativeTime'
import '@features/manager/styles/escalated.css'

const ESCALATED = [
  {
    id: 'esc1',
    emp: { name: "Marcus O'Brien", role: 'Engineer I', team: 'Platform', av: 'MO' },
    title: 'Formal performance improvement plan',
    body: 'A formal PIP was issued following three consecutive quarters of missed deliverables. Manager and HR aligned on a 90-day improvement window with fortnightly check-ins.',
    cat: 'perf',
    date: '2025-11-03',
    confidential: true,
  },
  {
    id: 'esc2',
    emp: { name: 'Sophie Okafor', role: 'Engineer II', team: 'Security', av: 'SO' },
    title: 'Conduct investigation — repeated lateness',
    body: 'HR opened a formal investigation after six documented incidents of arriving 30+ minutes late without prior notice. Employee was notified and a formal meeting scheduled.',
    cat: 'conduct',
    date: '2025-10-19',
    confidential: true,
  },
  {
    id: 'esc3',
    emp: { name: 'David Kim', role: 'Engineer I', team: 'Security', av: 'DK' },
    title: 'Verbal warning issued',
    body: 'A verbal warning was issued following a pattern of missed PR review deadlines affecting team delivery. Documented for the record. No further action at this stage.',
    cat: 'conduct',
    date: '2025-11-28',
    confidential: false,
  },
]

export default function Escalated() {
  return (
    <AppShell>
      <div className="es-page">
        <div className="es-topbar">
          <div className="es-title">Escalated</div>
          <div className="es-subtitle">Entries escalated to HR for formal process.</div>
        </div>

        <div className="es-list">
          {ESCALATED.map((item) => (
            <div key={item.id} className="es-item">
              <div className="es-item__emp">
                {item.emp.name} · {item.emp.role}
                {item.confidential && (
                  <span className="es-item__badge">Confidential</span>
                )}
              </div>
              <div className="es-item__title">{item.title}</div>
              <div className="es-item__body">{item.body}</div>
              <div className="es-item__foot">
                <span className="es-item__date">{relativeTime(item.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
