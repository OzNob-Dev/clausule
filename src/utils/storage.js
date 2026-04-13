const KEY = {
  theme:          'clausule-theme',
  authed:         'clausule-authed',
  role:           'clausule-role',
  mfa:            'clausule-mfa',
  email:          'clausule-email',
  escalatedCount: 'clausule-escalated-count',
  pitstop:        (path) => `clausule-ps-${path}`,
}

export const storage = {
  getTheme: () => localStorage.getItem(KEY.theme),
  setTheme: (v) => localStorage.setItem(KEY.theme, v),

  isAuthed:  () => !!localStorage.getItem(KEY.authed),
  setAuthed: () => localStorage.setItem(KEY.authed, '1'),
  clearAuth: () => {
    localStorage.removeItem(KEY.authed)
    localStorage.removeItem(KEY.role)
    localStorage.removeItem(KEY.mfa)
    localStorage.removeItem(KEY.email)
  },

  getRole: () => localStorage.getItem(KEY.role),
  setRole: (r) => localStorage.setItem(KEY.role, r),

  isMfaSetup:  () => !!localStorage.getItem(KEY.mfa),
  setMfaSetup: () => localStorage.setItem(KEY.mfa, '1'),

  getEmail: () => localStorage.getItem(KEY.email),
  setEmail: (e) => localStorage.setItem(KEY.email, e),

  getEscalatedCount: () => parseInt(localStorage.getItem(KEY.escalatedCount) || '3'),

  getPitstop: (path) => localStorage.getItem(KEY.pitstop(path)),
  setPitstop: (path, v) => localStorage.setItem(KEY.pitstop(path), v),
}
