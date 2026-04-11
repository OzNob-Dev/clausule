import { AppShell } from '../components/layout/AppShell'
import { Avatar } from '../components/ui/Avatar'
import { CategoryPill } from '../components/ui/CategoryPill'
import { relativeTime } from '../utils/relativeTime'

const ESCALATED = [
  {
    id: 'esc1',
    emp: { name: "Marcus O'Brien", role: 'Engineer I', team: 'Platform', av: 'MO', avBg: '#FCEBEB', avCol: '#A32D2D' },
    title: 'Formal performance improvement plan',
    cat: 'perf',
    date: '2025-11-03',
    confidential: true,
  },
  {
    id: 'esc2',
    emp: { name: 'Sophie Okafor', role: 'Engineer II', team: 'Security', av: 'SO', avBg: '#FCEBEB', avCol: '#A32D2D' },
    title: 'Conduct investigation — repeated lateness',
    cat: 'conduct',
    date: '2025-10-19',
    confidential: true,
  },
  {
    id: 'esc3',
    emp: { name: 'David Kim', role: 'Engineer I', team: 'Security', av: 'DK', avBg: '#FCEBEB', avCol: '#A32D2D' },
    title: 'Verbal warning issued',
    cat: 'conduct',
    date: '2025-11-28',
    confidential: false,
  },
]

export default function Escalated() {
  return (
    <AppShell>
      <div className="px-8 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-[20px] font-medium text-tp dark:text-tp-dark mb-0.5">Escalated</h1>
          <p className="text-[13px] text-tm dark:text-[#6B6B68]">Entries escalated to HR for formal process.</p>
        </div>

        {/* Banner */}
        <div className="flex items-start gap-2.5 px-4 py-3 bg-rb rounded-ledger mb-6 text-[13px] text-rt">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6"/><line x1="8" y1="5" x2="8" y2="8.5"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/>
          </svg>
          <p>These records are part of a formal HR process and are visible to HR only. Handle with care.</p>
        </div>

        {/* Entry list */}
        <div className="flex flex-col gap-3">
          {ESCALATED.map((item) => (
            <div
              key={item.id}
              className="bg-card dark:bg-card-dark border border-[rgba(0,0,0,0.07)] rounded-ledger p-4"
            >
              <div className="flex items-start gap-3">
                <Avatar initials={item.emp.av} bg={item.emp.avBg} color={item.emp.avCol} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-[14px] font-medium text-tp dark:text-tp-dark">{item.title}</h3>
                    {item.confidential && (
                      <span className="text-[10px] px-2 py-0.5 bg-rb text-rt rounded-full flex-shrink-0">Confidential</span>
                    )}
                  </div>
                  <div className="text-[13px] text-ts dark:text-[#9A9994] mb-2">
                    {item.emp.name} · {item.emp.role}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-tm">{relativeTime(item.date)}</span>
                    <span className="text-[11px] text-tc">·</span>
                    <CategoryPill cat={item.cat} showDot />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
