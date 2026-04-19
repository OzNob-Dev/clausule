'use client'

import { useState } from 'react'
import { AppShell } from '@features/manager/components/AppShell'
import AlertActionsCard from '@features/manager/settings/AlertActionsCard'
import AlertThresholdCard from '@features/manager/settings/AlertThresholdCard'
import DeleteAccountSection from '@features/manager/settings/DeleteAccountSection'
import FlaggedEmployeesTable from '@features/manager/settings/FlaggedEmployeesTable'
import { useAuth } from '@features/auth/context/AuthContext'
import '@features/manager/styles/settings-core.css'
import '@features/manager/styles/settings-danger.css'

export default function Settings() {
  const { logout } = useAuth()
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [combined, setCombined] = useState(true)
  const [conductThreshold, setConductThreshold] = useState(3)
  const [escalationThreshold, setEscalationThreshold] = useState(2)
  const [needsWorkWeeks, setNeedsWorkWeeks] = useState(3)
  const [window, setWindow] = useState('60 days')
  const [actions, setActions] = useState({ notifyHR: true, flagRecord: true, notifyMgr: false, autoSummary: false })

  const toggleAction = (key) => setActions((a) => ({ ...a, [key]: !a[key] }))
  const confirmReady = deleteConfirmText === 'DELETE'

  return (
    <AppShell>
      <div className="st-page">
        <div className="st-content">

          <div className="st-title">Signal settings</div>
          <div className="st-subtitle">Configure when Clausule surfaces HR alerts.</div>

          <div className="st-divider" />

          <AlertThresholdCard
            combined={combined}
            onToggleCombined={() => setCombined((current) => !current)}
            values={{ conductThreshold, escalationThreshold, needsWorkWeeks }}
            onChangeThreshold={(key, value) => {
              if (key === 'conductThreshold') setConductThreshold(value)
              if (key === 'escalationThreshold') setEscalationThreshold(value)
              if (key === 'needsWorkWeeks') setNeedsWorkWeeks(value)
            }}
            window={window}
            onChangeWindow={setWindow}
          />

          <AlertActionsCard
            actions={actions}
            conductThreshold={conductThreshold}
            escalationThreshold={escalationThreshold}
            onToggleAction={toggleAction}
            window={window}
          />

          <FlaggedEmployeesTable />

          <button className="st-btn-save">Save settings</button>

          <DeleteAccountSection
            confirmReady={confirmReady}
            deleteConfirmText={deleteConfirmText}
            deleteModal={deleteModal}
            onCancelDelete={() => setDeleteModal(false)}
            onChangeConfirmText={setDeleteConfirmText}
            onCloseModal={() => setDeleteModal(false)}
            onConfirmDelete={() => logout()}
            onOpenDelete={() => {
              setDeleteConfirmText('')
              setDeleteModal(true)
            }}
          />

        </div>
      </div>

    </AppShell>
  )
}
