export default function ComingSoon() {
  return (
    <div className="coming-soon-wrapper relative grid min-h-screen w-screen grid-rows-[1fr_auto] overflow-hidden bg-[#F5F2EC] font-[var(--cl-font-sans)] text-[#1A1F2B] [--acc:var(--cl-accent)] [--canvas:#F5F2EC] [--nav:var(--cl-surface-ink)] [--sans:var(--cl-font-sans)] [--serif:var(--cl-font-editorial)] [--tc:#C4C0BA] [--terra:var(--cl-accent)] [--tm:#9A9994] [--tp:#1A1F2B] [--ts:#4A4A47] before:absolute before:inset-0 before:bg-[repeating-linear-gradient(to_bottom,transparent,transparent_47px,var(--cl-grid-2)_47px,var(--cl-grid-2)_48px)] before:content-['']">
      <main className="relative z-[1] flex max-w-[860px] flex-col justify-center px-[10vw] py-20 max-[600px]:px-7 max-[600px]:py-[60px]">
        <div className="eyebrow mb-7 text-[var(--cl-text-2xs)] uppercase tracking-[3px] text-[var(--terra)]">
          In development · Built for managers and their teams
        </div>

        <h1 className="mb-8 font-[var(--cl-font-sans)] text-[clamp(42px,6vw,76px)] font-black leading-[1.04] tracking-[-2.5px] text-[var(--tp)]">
          The intelligence layer for your professional interactions.
        </h1>

        <p className="sub max-w-[580px] border-l-2 border-l-[var(--acc)] pl-5 font-[var(--cl-font-editorial)] text-[clamp(16px,2vw,20px)] font-light italic leading-[1.78] text-[var(--ts)]">
          We do the heavy lifting for professional record-keeping. Turn simple 1:1 inputs into persistent performance narratives and career-spanning documentation.
        </p>
      </main>

      <footer className="relative z-[1] flex items-center justify-between border-t border-t-[rgba(0,0,0,0.09)] px-[10vw] py-[22px] max-[600px]:px-7 max-[600px]:py-[18px]">
        <div className="logo text-[var(--cl-text-2xs)] font-medium uppercase tracking-[5px] text-[var(--tp)]">
          CLAU<span>SULE</span>
        </div>
        <div className="footer-note text-[var(--cl-text-xs)] text-[var(--tm)] max-[600px]:hidden">© 2026</div>
      </footer>
    </div>
  )
}
