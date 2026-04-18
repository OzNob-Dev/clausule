import { useState, useEffect } from 'react'
import { storage } from '../utils/storage'

export function useTheme() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setDark(storage.getTheme() === 'dark')
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.body.classList.toggle('dark', dark)
    storage.setTheme(dark ? 'dark' : 'light')
  }, [dark, mounted])

  return { dark, toggle: () => setDark((d) => !d) }
}
