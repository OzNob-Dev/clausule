'use client'

import { Modal } from '@shared/components/ui/Modal'
import { useVerification } from '@features/account/context/VerificationContext'
import '@features/account/styles/profile.css'

export function VerifyChangesModal({ open, onClose, onSubmit }) {
  const {
    verification,
    saving,
    emailChanged,
    mobileChanged,
    initial,
    current,
    security,
  } = useVerification()

  const {
    finalReady,
    emailCode, setEmailCode, emailCodeState,
    mobileCheck, setMobileCheck,
    mobileAck, setMobileAck,
  } = verification

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Verify changes"
      footer={
        <>
          <button type="button" className="profile-btn profile-btn--ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="profile-btn profile-btn--primary" onClick={onSubmit} disabled={saving || !finalReady}>
            Finalise
          </button>
        </>
      }
    >
      <div className="profile-modal">
        <p className="profile-modal-copy">We need a final check before saving contact changes.</p>

        <dl className="profile-change-list">
          {emailChanged && (
            <>
              <dt>Email</dt>
              <dd>{initial.email || 'Not set'}{' -> '}{current.email}</dd>
            </>
          )}
          {mobileChanged && (
            <>
              <dt>Mobile</dt>
              <dd>{initial.mobile || 'Not set'}{' -> '}{current.mobile}</dd>
            </>
          )}
        </dl>

        {emailChanged && (
          <div className="profile-verify">
            <div className="profile-verify-title">Email verification</div>
            <div className="profile-modal-copy">
              A code was sent to {current.email}. Enter it here to confirm the new sign-in email.
            </div>
            <input
              className="profile-input"
              inputMode="numeric"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
            />
            <div className="profile-verify-meta">
              {emailCodeState === 'sending' && 'Sending code...'}
              {emailCodeState === 'sent'    && 'Code sent'}
              {emailCodeState === 'error'   && 'Code delivery failed'}
            </div>
          </div>
        )}

        {mobileChanged && (
          <div className={`profile-warning${security.ssoConfigured ? '' : ' profile-warning--strong'}`}>
            <div className="profile-warning-title">Mobile change warning</div>
            <p>
              {security.ssoConfigured
                ? 'You sign in with SSO, so this should not interrupt your 2FA setup.'
                : 'This can affect your 2FA and recovery path if you did not sign in with SSO.'}
            </p>
            <label className="profile-check">
              <input type="checkbox" checked={mobileAck} onChange={(e) => setMobileAck(e.target.checked)} />
              I understand and want to continue
            </label>
            <input
              className="profile-input"
              value={mobileCheck}
              onChange={(e) => setMobileCheck(e.target.value)}
              placeholder="Re-enter the new mobile number"
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
