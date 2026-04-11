import { useState, useEffect } from 'react'
import { storage } from '../utils/storage'

export function useTheme() {
  const [dark, setDark] = useState(() => storage.getTheme() === 'dark')

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    storage.setTheme(dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}
