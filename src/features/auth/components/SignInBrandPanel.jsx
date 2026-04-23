export default function SignInBrandPanel() {
  return (
    <div className="w-[268px] shrink-0 bg-nav flex flex-col justify-between py-8 px-7 max-sm:hidden">
      <div className="flex items-center gap-[9px]">
        <div className="w-7 h-7 bg-acc rounded-lg flex items-center justify-center shrink-0">
          <svg viewBox="0 0 18 18" fill="none" stroke="var(--canvas)" strokeWidth="2.2" strokeLinecap="round" className="w-[15px] h-[15px]">
            <path d="M3 5h12M3 9h8M3 13h5" />
          </svg>
        </div>
        <span className="text-[15px] font-extrabold text-canvas tracking-[-0.3px]">clausule</span>
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-[26px] font-black text-canvas tracking-[-0.8px] leading-[1.15] m-0">Thoughtful records.<br />Better conversations.</h1>
        <p className="text-[13px] text-tx-3 leading-[1.7] not-italic m-0">The file note tool built for managers who care about their people — and a brag doc for the people themselves.</p>
      </div>
      <div className="text-[11px] text-tx-2">Built for teams who care</div>
    </div>
  )
}
