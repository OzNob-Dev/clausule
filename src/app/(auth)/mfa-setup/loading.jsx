import PageLoader from '@shared/components/ui/PageLoader'
import '@mfa/styles/mfa-setup.css'
import '@shared/styles/page-loader.css'

export default function Loading() {
  return (
    <div className="mfa-wrap" aria-busy="true">
      <PageLoader variant="mfa" />
    </div>
  )
}
