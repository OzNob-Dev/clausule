import { useState } from 'react'
import DeviceIcon from './DeviceIcon'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function DeviceList({ devices, passkeyAvailable, registering, registerError, onAdd, onRemove }) {
  const [removeTarget, setRemoveTarget] = useState(null)

  const handleRemove = (id) => {
    onRemove(id)
    setRemoveTarget(null)
  }

  return (
    <>
      <div className="bss-card-head">
        <div>
          <div className="bss-card-title">Registered devices</div>
          <div className="bss-card-sub">
            Each device listed here can sign you in with Face ID, Touch ID, or Windows Hello — no password required.
          </div>
        </div>
        {passkeyAvailable === true && (
          <button className="bss-add-btn" onClick={onAdd} disabled={registering} aria-busy={registering}>
            {registering ? (
              <><span className="bss-spinner" aria-hidden="true" />Waiting for device…</>
            ) : (
              <>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <line x1="8" y1="3" x2="8" y2="13"/>
                  <line x1="3" y1="8" x2="13" y2="8"/>
                </svg>
                Add this device
              </>
            )}
          </button>
        )}
      </div>

      {devices.length === 0 ? (
        <p className="bss-empty">No devices registered — add this device to enable biometric sign-in.</p>
      ) : (
        <ul className="bss-device-list" aria-label="Registered biometric devices">
          {devices.map((device) => {
            const confirming = removeTarget === device.id
            return (
              <li key={device.id} className={`bss-device-row${confirming ? ' bss-device-row--confirming' : ''}`}>
                <div className="bss-device-icon">
                  <DeviceIcon type={device.type} />
                </div>
                <div className="bss-device-info">
                  <div className="bss-device-name">
                    {device.name}
                    {device.isCurrent && <span className="bss-current-badge">This device</span>}
                  </div>
                  <div className="bss-device-meta">
                    {device.method} · Added {formatDate(device.addedAt)}
                  </div>
                </div>
                {confirming ? (
                  <button className="bss-remove-btn" onClick={() => setRemoveTarget(null)} aria-label="Cancel removal">
                    Cancel
                  </button>
                ) : (
                  <button className="bss-remove-btn" onClick={() => setRemoveTarget(device.id)} aria-label={`Remove ${device.name}`}>
                    Remove
                  </button>
                )}
                {confirming && (
                  <div className="bss-remove-confirm" role="alert">
                    <p className="bss-remove-confirm-text">
                      {devices.length === 1
                        ? "This is your only device — you'll need your authenticator app to sign in after removing it."
                        : `This device will no longer be able to sign in with ${device.method}.`}
                    </p>
                    <button className="bss-btn-confirm-remove-inline" onClick={() => handleRemove(device.id)}>
                      Yes, remove
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {registerError && (
        <p className="bss-error" role="alert">{registerError}</p>
      )}

      {passkeyAvailable === false && (
        <div className="bss-notice">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5"/>
            <line x1="8" y1="5" x2="8" y2="8.5"/>
            <circle cx="8" cy="11" r="0.5" fill="currentColor" stroke="none"/>
          </svg>
          Biometric authentication isn't available in this browser. Try Chrome, Safari, or Edge on a device with a fingerprint reader or camera.
        </div>
      )}
    </>
  )
}
