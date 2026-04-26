import PageLoader from '@shared/components/ui/PageLoader'
import '@shared/styles/page-loader.css'

export default function Loading() {
  return (
    <div className="be-main page-loader-wrap" aria-busy="true">
      <PageLoader variant="profile" />
    </div>
  )
}
