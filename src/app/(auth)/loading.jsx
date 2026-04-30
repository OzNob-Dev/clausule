import LoadingOverlay from '@shared/components/ui/LoadingOverlay'

export default function Loading() {
  return (
    <div className="relative min-h-[55vh] w-full overflow-hidden" aria-busy="true">
      <LoadingOverlay />
    </div>
  )
}
