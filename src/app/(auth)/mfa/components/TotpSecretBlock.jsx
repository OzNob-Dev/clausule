import dynamic from 'next/dynamic'
import { Button } from '@shared/components/ui/Button'

// QRCodeSVG is only needed during MFA setup — lazy-load to keep the main
// bundle free of the qrcode.react dependency (~45KB gzipped).
const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((m) => ({ default: m.QRCodeSVG })),
  {
    ssr: false,
    loading: () => (
      <div className="tsb-qr-loading" role="img" aria-label="Loading QR code" />
    ),
  }
)

function CopyIcon({ copied }) {
  return copied ? (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M2 7l3.5 3.5L12 3" />
    </svg>
  ) : (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="4" y="4" width="8" height="8" rx="1" />
      <path d="M2 10V3a1 1 0 0 1 1-1h7" />
    </svg>
  )
}

export default function TotpSecretBlock({
  copied,
  contentClassName = '',
  layoutClassName = '',
  qrClassName,
  qrSize,
  secret,
  secretClassName,
  secretAriaLabel = 'Manual entry key',
  secretRowClassName,
  uri,
  onCopy,
  children,
}) {
  return (
    <div className={`tsb-layout ${layoutClassName}`.trim()}>
      {uri && (
        <div className={qrClassName} aria-label="QR code for authenticator app">
          <QRCodeSVG value={uri} size={qrSize} bgColor="#FAF7F3" fgColor="#2A221A" level="M" />
        </div>
      )}
      <div className={contentClassName}>
        <div className={secretRowClassName}>
          <code className={secretClassName} role="textbox" aria-readonly="true" aria-label={secretAriaLabel}>{secret}</code>
          <Button type="button" variant="ghost" className="copy" onClick={onCopy} aria-label="Copy secret key">
            <CopyIcon copied={copied} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}
