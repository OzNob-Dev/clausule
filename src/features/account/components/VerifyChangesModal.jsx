'use client'

import { Modal } from '@shared/components/ui/Modal'
import { cn } from '@shared/utils/cn'
import {
  btnClass, btnGhostClass, btnPrimaryClass,
  modalClass, modalCopyClass,
  changeListClass, changeListDtClass, changeListDdClass,
  verifyClass, verifyTitleClass, verifyMetaClass,
  warningBaseClass, warningTitleClass,
  checkClass, inputClass,
} from '@features/account/styles'

export function VerifyChangesModal({
  open, onClose, saving, finalReady,
  initial, current,
  emailChanged, mobileChanged, security,
  emailCode, setEmailCode, emailCodeState,
  mobileCheck, setMobileCheck,
  mobileAck, setMobileAck,
  onSubmit,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Verify changes"
      footer={
        <>
          <button type="button" className={cn(btnClass, btnGhostClass)} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className={cn(btnClass, btnPrimaryClass)} onClick={onSubmit} disabled={saving || !finalReady}>
            Finalise
          </button>
        </>
      }
    >
      <div className={modalClass}>
        <p className={modalCopyClass}>We need a final check before saving contact changes.</p>

        <dl className={changeListClass}>
          {emailChanged && (
            <>
              <dt className={changeListDtClass}>Email</dt>
              <dd className={changeListDdClass}>{initial.email || 'Not set'}{' -> '}{current.email}</dd>
            </>
          )}
          {mobileChanged && (
            <>
              <dt className={changeListDtClass}>Mobile</dt>
              <dd className={changeListDdClass}>{initial.mobile || 'Not set'}{' -> '}{current.mobile}</dd>
            </>
          )}
        </dl>

        {emailChanged && (
          <div className={verifyClass}>
            <div className={verifyTitleClass}>Email verification</div>
            <div className={modalCopyClass}>
              A code was sent to {current.email}. Enter it here to confirm the new sign-in email.
            </div>
            <input
              className={inputClass}
              inputMode="numeric"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
            />
            <div className={verifyMetaClass}>
              {emailCodeState === 'sending' && 'Sending code...'}
              {emailCodeState === 'sent'    && 'Code sent'}
              {emailCodeState === 'error'   && 'Code delivery failed'}
            </div>
          </div>
        )}

        {mobileChanged && (
          <div className={cn(warningBaseClass, security.ssoConfigured ? 'bg-[rgba(200,83,42,0.07)]' : 'bg-[rgba(184,50,50,0.1)]')}>
            <div className={warningTitleClass}>Mobile change warning</div>
            <p className="m-0 text-xs leading-relaxed text-tp">
              {security.ssoConfigured
                ? 'You sign in with SSO, so this should not interrupt your 2FA setup.'
                : 'This can affect your 2FA and recovery path if you did not sign in with SSO.'}
            </p>
            <label className={checkClass}>
              <input type="checkbox" className="w-4 h-4" checked={mobileAck} onChange={(e) => setMobileAck(e.target.checked)} />
              I understand and want to continue
            </label>
            <input
              className={inputClass}
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
