'use client'

import { Button } from '@shared/components/ui/Button'
import { Modal } from '@shared/components/ui/Modal'
import { Field, FieldCheckbox, FieldHint, FieldInput, FieldLabel } from '@shared/components/ui/Field'
import { useVerification } from '@account/context/VerificationContext'
import '@account/styles/profile.css'

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
  const emailCodeHintId = 'profile-email-verification-hint'
  const mobileCheckHintId = 'profile-mobile-confirmation-hint'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Verify changes"
      footer={
        <>
          <Button type="button" variant="ghost" className="profile-btn profile-btn--ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" variant="primary" className="profile-btn profile-btn--primary" onClick={onSubmit} disabled={saving || !finalReady}>
            Save changes
          </Button>
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
            <p className="profile-modal-copy" id={emailCodeHintId}>
              A code was sent to {current.email}. Enter it here to confirm the new sign-in email.
            </p>
            <Field>
              <FieldLabel htmlFor="profile-email-verification-code">Verification code</FieldLabel>
              <FieldInput
                id="profile-email-verification-code"
                className="profile-input"
                inputMode="numeric"
                value={emailCode}
                aria-describedby={emailCodeHintId}
                onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
              />
            </Field>
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
              <FieldCheckbox checked={mobileAck} onChange={(e) => setMobileAck(e.target.checked)} />
              I understand and want to continue
            </label>
            <Field>
              <FieldLabel htmlFor="profile-mobile-confirmation">Re-enter the new mobile number</FieldLabel>
              <FieldInput
                id="profile-mobile-confirmation"
                className="profile-input"
                value={mobileCheck}
                aria-describedby={mobileCheckHintId}
                onChange={(e) => setMobileCheck(e.target.value)}
                placeholder="Re-enter the new mobile number"
              />
              <FieldHint className="profile-help" id={mobileCheckHintId}>Type the new mobile number exactly as it should be saved.</FieldHint>
            </Field>
          </div>
        )}
      </div>
    </Modal>
  )
}
