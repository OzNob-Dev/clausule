import SsoProviderIcon from '@shared/components/SsoProviderIcon'
import { getActiveSsoProviders, ssoAuthPath } from '@shared/utils/sso'

export default function SsoButtons({ config }) {
  const enabledProviders = getActiveSsoProviders(config)
  if (!enabledProviders.length) return null

  return (
    <>
      <div className="flex items-center gap-3 my-[22px]">
        <div className="flex-1 h-[1px] bg-rule" />
        <span className="text-[11px] text-tm">or continue with</span>
        <div className="flex-1 h-[1px] bg-rule" />
      </div>

      {enabledProviders.map((provider) => (
        <button key={provider.id} type="button" className="w-full py-[11px] px-4 bg-[#F5F0EA] text-ts border-[1.5px] border-rule-em rounded-[var(--r)] text-[14px] font-bold cursor-pointer font-sans mb-[10px] transition-all duration-[120ms] flex items-center gap-3 text-left last:mb-0 hover:bg-[#EDE8E0] hover:border-[rgba(26,21,16,0.35)] hover:text-[#1A1510]" onClick={() => { window.location.href = ssoAuthPath(provider.id) }}>
          <span className="w-[22px] h-[22px] shrink-0 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5"><SsoProviderIcon provider={provider.id} /></span>
          <span className="flex-1">{provider.ctaLabel}</span>
          <span className="text-tm">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="w-[14px] h-[14px]"><polyline points="6 4 10 8 6 12"/></svg>
          </span>
        </button>
      ))}
    </>
  )
}
