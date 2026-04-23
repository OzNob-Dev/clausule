'use client'

import { AppShell } from '@features/manager/components/AppShell'
import { relativeTime } from '@shared/utils/relativeTime'

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
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="shrink-0 pt-6 px-8 pb-0 mb-5 max-sm:px-4 max-sm:pt-4">
          <div className="text-[22px] font-black text-tx-1 tracking-[-0.6px]">Escalated</div>
          <div className="text-xs font-medium text-tx-3 mt-[3px]">Entries escalated to HR for formal process.</div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-[60px] max-sm:px-4 max-sm:pb-[60px]">
          {ESCALATED.map((item) => (
            <div key={item.id} className="py-5 pr-0 pl-[18px] border-b border-border border-l-[3px] border-l-red cursor-pointer transition-[padding-left] duration-150 hover:pl-[22px]">
              <div className="text-[10px] font-extrabold text-red uppercase tracking-[0.8px] mb-1.5">
                {item.emp.name} · {item.emp.role}
                {item.confidential && (
                  <span className="text-[9px] py-[1px] px-1.5 rounded bg-red-bg text-red font-extrabold ml-2">Confidential</span>
                )}
              </div>
              <div className="text-[17px] font-extrabold text-tx-1 mb-2 tracking-[-0.3px] leading-[1.25]">{item.title}</div>
              <div className="text-[13px] text-tx-2 leading-[1.75]">{item.body}</div>
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-[11px] font-semibold text-tx-3">{relativeTime(item.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
