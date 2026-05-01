import dynamic from 'next/dynamic'
import { Button } from '@shared/components/ui/Button'
import { CopyIcon } from '@shared/components/ui/icon/CopyIcon'

// QRCodeSVG is only needed during MFA setup — lazy-load to keep the main
// bundle free of the qrcode.react dependency (~45KB gzipped).
const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((m) => ({ default: m.QRCodeSVG })),
  {
    ssr: false,
    loading: () => (
      <div className="tsb-qr-loading h-[148px] w-[148px] rounded-lg bg-[var(--cl-brown-alpha-08)]" role="img" aria-label="Loading QR code" />
    ),
  }
)

export default function TotpSecretBlock({
  copied,
  contentClassName = '',
  copyClassName = '',
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
          <Button type="button" variant="ghost" className={copyClassName || 'copy'} onClick={onCopy} aria-label="Copy secret key">
            <CopyIcon copied={copied} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}
