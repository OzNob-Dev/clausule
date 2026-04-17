'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { storage } from '@/utils/storage'

export default function ProtectedLayout({ children }) {
  const router  = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!storage.isAuthed() || !storage.isMfaSetup()) {
      router.replace('/')
    } else {
      setReady(true)
    }
  }, [router])

  if (!ready) return null
  return children
}
