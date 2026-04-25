'use client'

import { useCallback, useState } from 'react'
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
  const [thresholds, setThresholds] = useState({ conductThreshold: 3, escalationThreshold: 2, needsWorkWeeks: 3 })
  const [timeWindow, setTimeWindow] = useState('60 days')
  const [actions, setActions] = useState({ notifyHR: true, flagRecord: true, notifyMgr: false, autoSummary: false })

  const toggleCombined = useCallback(() => setCombined((c) => !c), [])
  const handleThresholdChange = useCallback((key, value) => setThresholds((t) => ({ ...t, [key]: value })), [])
  const toggleAction = useCallback((key) => setActions((a) => ({ ...a, [key]: !a[key] })), [])
  const openDelete = useCallback(() => { setDeleteConfirmText(''); setDeleteModal(true) }, [])
  const closeDelete = useCallback(() => setDeleteModal(false), [])

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
            onToggleCombined={toggleCombined}
            values={thresholds}
            onChangeThreshold={handleThresholdChange}
            timeWindow={timeWindow}
            onChangeWindow={setTimeWindow}
          />

          <AlertActionsCard
            actions={actions}
            conductThreshold={thresholds.conductThreshold}
            escalationThreshold={thresholds.escalationThreshold}
            onToggleAction={toggleAction}
            timeWindow={timeWindow}
          />

          <FlaggedEmployeesTable />

          <button type="button" className="st-btn-save">Save settings</button>

          <DeleteAccountSection
            confirmReady={confirmReady}
            deleteConfirmText={deleteConfirmText}
            deleteModal={deleteModal}
            onCancelDelete={closeDelete}
            onChangeConfirmText={setDeleteConfirmText}
            onCloseModal={closeDelete}
            onConfirmDelete={logout}
            onOpenDelete={openDelete}
          />

        </div>
      </div>

    </AppShell>
  )
}
