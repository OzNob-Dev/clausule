'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@shared/utils/routes'
import { sendFeedbackAction } from '@actions/brag-actions'
import FeedbackFormView from './FeedbackFormView'

export default function FeedbackComposer({ userEmail, onClose, onSent }) {
  const router = useRouter()
  const [category, setCategory] = useState('Idea')
  const [feeling, setFeeling] = useState('Just noting')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [improvement, setImprovement] = useState('')
  const [contactOk, setContactOk] = useState(true)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const canSend = subject.trim() && message.trim()
  const close = onClose ?? (() => router.push(ROUTES.brag))

  const sendFeedbackMutation = useMutation({
    mutationFn: () => sendFeedbackAction({
      category,
      feeling,
      subject: subject.trim(),
      message: message.trim(),
      improvement: improvement.trim(),
      contactOk,
    }),
  })

  const handleSend = async () => {
    if (!canSend) return

    setError('')

    try {
      const feedback = await sendFeedbackMutation.mutateAsync()
      onSent?.(feedback)
      setSent(true)
    } catch {
      setError('Could not send this feedback. Please try again.')
    }
  }

  return (
    <FeedbackFormView
      userEmail={userEmail}
      category={category}
      feeling={feeling}
      subject={subject}
      message={message}
      improvement={improvement}
      contactOk={contactOk}
      canSend={canSend}
      sending={sendFeedbackMutation.isPending}
      sent={sent}
      error={error}
      onCategoryChange={setCategory}
      onFeelingChange={setFeeling}
      onSubjectChange={setSubject}
      onMessageChange={setMessage}
      onImprovementChange={setImprovement}
      onContactOkChange={setContactOk}
      onCancel={close}
      onSend={handleSend}
    />
  )
}
