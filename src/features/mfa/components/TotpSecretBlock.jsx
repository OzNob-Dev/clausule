import { QRCodeSVG } from 'qrcode.react'

function CopyIcon({ copied }) {
  return copied ? (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 7l3.5 3.5L12 3" />
    </svg>
  ) : (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="8" height="8" rx="1" />
      <path d="M2 10V3a1 1 0 0 1 1-1h7" />
    </svg>
  )
}

export default function TotpSecretBlock({
  copied,
  copyClassName,
  qrClassName,
  qrSize,
  secret,
  secretClassName,
  secretRowClassName,
  uri,
  onCopy,
}) {
  return (
    <>
      {uri && (
        <div className={qrClassName} aria-label="QR code for authenticator app">
          <QRCodeSVG value={uri} size={qrSize} bgColor="#FAF7F3" fgColor="#2A221A" level="M" />
        </div>
      )}
      <div className={secretRowClassName}>
        <code className={secretClassName}>{secret}</code>
        <button className={copyClassName} onClick={onCopy} aria-label="Copy secret key">
          <CopyIcon copied={copied} />
        </button>
      </div>
    </>
  )
}
