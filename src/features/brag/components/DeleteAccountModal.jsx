'use client'

import { DeleteAccountDialog } from '@features/account/components/DeleteAccountDialog'

export default function DeleteAccountModal({ open, onClose }) {
  return (
    <DeleteAccountDialog
      open={open}
      onClose={onClose}
      description="This will permanently delete your brag doc and all associated entries, evidence files, and records from our servers. This action cannot be undone."
    />
  )
}
