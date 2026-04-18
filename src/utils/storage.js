const KEY = {
  theme:          'clausule-theme',
  email:          'clausule-email',
  mfaSetup:       'clausule-mfa-setup',
  escalatedCount: 'clausule-escalated-count',
  pitstop:        (path) => `clausule-ps-${path}`,
}

export const storage = {
  getTheme: () => localStorage.getItem(KEY.theme),
  setTheme: (v) => localStorage.setItem(KEY.theme, v),

  // Email is stored briefly during the sign-in/signup → MFA-setup flow
  // so the MFA setup page can display the address. Cleared on sign-out
  // by the server expiring the auth cookies.
  getEmail: () => localStorage.getItem(KEY.email),
  setEmail: (e) => localStorage.setItem(KEY.email, e),

  getMfaSetup: () => localStorage.getItem(KEY.mfaSetup) === 'true',
  setMfaSetup: (v) => localStorage.setItem(KEY.mfaSetup, String(v)),

  getEscalatedCount: () => parseInt(localStorage.getItem(KEY.escalatedCount) || '3'),

  getPitstop: (path) => localStorage.getItem(KEY.pitstop(path)),
  setPitstop: (path, v) => localStorage.setItem(KEY.pitstop(path), v),
}
