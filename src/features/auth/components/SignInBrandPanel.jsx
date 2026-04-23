export default function SignInBrandPanel() {
  return (
    <div className="w-[268px] shrink-0 bg-[#2A221A] flex flex-col justify-between py-8 px-7 max-sm:hidden">
      <div className="flex items-center gap-[9px]">
        <div className="w-7 h-7 bg-acc rounded-lg flex items-center justify-center shrink-0">
          <svg viewBox="0 0 18 18" fill="none" stroke="#FBF7F2" strokeWidth="2.2" strokeLinecap="round" className="w-[15px] h-[15px]">
            <path d="M3 5h12M3 9h8M3 13h5" />
          </svg>
        </div>
        <span className="text-[15px] font-extrabold text-[#FBF7F2] tracking-[-0.3px]">clausule</span>
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-[26px] font-black text-[#FBF7F2] tracking-[-0.8px] leading-[1.15] m-0">Thoughtful records.<br />Better conversations.</h1>
        <p className="text-[13px] text-[#B8B2AC] leading-[1.7] not-italic m-0">The file note tool built for managers who care about their people — and a brag doc for the people themselves.</p>
      </div>
      <div className="text-[11px] text-[#C8C4BE]">Built for teams who care</div>
    </div>
  )
}
