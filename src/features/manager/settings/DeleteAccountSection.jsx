'use client'

import { DeleteAccountDialog } from '@features/account/components/DeleteAccountDialog'

export default function DeleteAccountSection({
  deleteModal,
  onCloseModal,
  onOpenDelete,
}) {
  return (
    <>
      <div className="st-danger-section">
        <div className="st-danger-label">Danger zone</div>
        <div className="st-danger-card">
          <div className="st-danger-inner">
            <div>
              <div className="st-danger-title">Delete account</div>
              <div className="st-danger-desc">
                Permanently remove your account and all associated data. This cannot be undone.
              </div>
            </div>
            <button type="button" onClick={onOpenDelete} className="st-btn-delete-account">
              Delete account
            </button>
          </div>
        </div>
      </div>

      <DeleteAccountDialog
        open={deleteModal}
        onClose={onCloseModal}
        description="This will permanently delete your account and remove any connected manager workspace records from our servers. This action cannot be undone."
      />
    </>
  )
}
