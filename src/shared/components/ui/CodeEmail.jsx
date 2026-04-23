export default function CodeEmail({ to, code = '••••••', revealed = false }) {
  return (
    <div className="w-full overflow-hidden rounded-[12px] border border-[rgba(60,45,35,0.13)] bg-white text-left shadow-[0_2px_12px_rgba(60,45,35,0.07)]" aria-label="Demo verification email" role="img">
      <div className="flex items-center gap-[5px] border-b border-black/10 bg-[#f5f5f5] px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <div className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <div className="h-2 w-2 rounded-full bg-[#28c840]" />
        <span className="ml-1.5 text-[10px] font-semibold tracking-[0.3px] text-[#888]">Mail</span>
      </div>

      <div className="flex items-center gap-2.5 border-b border-[rgba(60,45,35,0.07)] px-4 pb-2 pt-3">
        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[rgba(208,90,52,0.85)] text-[13px] font-bold text-white" aria-hidden="true">C</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11.5px] font-semibold text-[#1a1a1a]">Clausule <span className="text-[10.5px] font-normal text-[#888]">&lt;noreply@clausule.app&gt;</span></div>
          <div className="mt-px text-[10.5px] text-[#888]">To: {to}</div>
        </div>
        <div className="shrink-0 text-[10px] text-[#aaa]">just now</div>
      </div>

      <div className="px-4 pb-1 pt-2 text-[12px] font-bold text-[#1a1a1a]">Your Clausule sign-in code</div>

      <div className="px-4 pb-4 pt-1">
        <p className="m-0 mb-1 text-[12px] text-[#333]">Hi there,</p>
        <p className="m-0 mb-3 text-[11.5px] leading-[1.5] text-[#555]">Use the code below to sign in. It expires in 10 minutes.</p>
        <div className="mb-3 flex gap-[5px]" aria-label="Verification code sent to your email">
          {Array.from({ length: 6 }, (_, i) => (
            <span
              key={i}
              className="relative flex h-9 w-[30px] items-center justify-center rounded-[6px] border-[1.5px] border-[rgba(208,90,52,0.15)] bg-[rgba(208,90,52,0.08)] text-[16px] font-extrabold text-transparent select-none after:absolute after:text-[18px] after:leading-none after:text-[#C0532A] after:content-['•']"
            >
              {revealed ? code[i] ?? '•' : '•'}
            </span>
          ))}
        </div>
        <p className="m-0 text-[10.5px] leading-[1.5] text-[#aaa]">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
  )
}
