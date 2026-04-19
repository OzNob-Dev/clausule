const KEY = {
  theme:          'clausule-theme',
  pitstop:        (path) => `clausule-ps-${path}`,
}

function getLocalStorage() {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

function getSessionStorage() {
  if (typeof window === 'undefined') return null
  return window.sessionStorage
}

export const storage = {
  getTheme: () => getLocalStorage()?.getItem(KEY.theme),
  setTheme: (v) => getLocalStorage()?.setItem(KEY.theme, v),

  getPitstop: (path) => getSessionStorage()?.getItem(KEY.pitstop(path)),
  setPitstop: (path, v) => getSessionStorage()?.setItem(KEY.pitstop(path), v),
}
