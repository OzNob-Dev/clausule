import { AppShell } from '../components/layout/AppShell'
import { relativeTime } from '../utils/relativeTime'

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
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="flex-shrink-0" style={{ padding: '24px 32px 0', marginBottom: '20px' }}>
          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--tx-1)', letterSpacing: '-0.6px' }}>Escalated</div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--tx-3)', marginTop: '3px' }}>
            Entries escalated to HR for formal process.
          </div>
        </div>

        {/* Entry list */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '0 32px 60px' }}>
          {ESCALATED.map((item) => (
            <div
              key={item.id}
              className="cursor-pointer transition-all duration-150"
              style={{
                padding: '20px 0 20px 18px',
                borderBottom: '1px solid var(--border)',
                borderLeft: '3px solid var(--red)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = '22px' }}
              onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = '18px' }}
            >
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                {item.emp.name} · {item.emp.role}
                {item.confidential && (
                  <span
                    className="ml-2"
                    style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', background: 'var(--red-bg)', color: 'var(--red)', fontWeight: 800 }}
                  >
                    Confidential
                  </span>
                )}
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--tx-1)', marginBottom: '8px', letterSpacing: '-0.3px', lineHeight: 1.25 }}>
                {item.title}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--tx-2)', lineHeight: 1.75 }}>
                {item.body}
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--tx-3)' }}>{relativeTime(item.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
