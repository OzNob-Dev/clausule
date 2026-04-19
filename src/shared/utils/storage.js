const KEY = {
  theme:          'clausule-theme',
  email:          'clausule-email',
  mfaSetup:       'clausule-mfa-setup',
  escalatedCount: 'clausule-escalated-count',
  pitstop:        (path) => `clausule-ps-${path}`,
}

function getStorage() {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export const storage = {
  getTheme: () => getStorage()?.getItem(KEY.theme),
  setTheme: (v) => getStorage()?.setItem(KEY.theme, v),

  // Email is stored briefly during the sign-in/signup → MFA-setup flow
  // so the MFA setup page can display the address. Cleared on sign-out
  // by the server expiring the auth cookies.
  getEmail: () => getStorage()?.getItem(KEY.email),
  setEmail: (e) => getStorage()?.setItem(KEY.email, e),

  getMfaSetup: () => getStorage()?.getItem(KEY.mfaSetup) === 'true',
  setMfaSetup: (v) => getStorage()?.setItem(KEY.mfaSetup, String(v)),

  getEscalatedCount: () => parseInt(getStorage()?.getItem(KEY.escalatedCount) || '3', 10),

  getPitstop: (path) => getStorage()?.getItem(KEY.pitstop(path)),
  setPitstop: (path, v) => getStorage()?.setItem(KEY.pitstop(path), v),
}
