const KEY = {
  theme: 'ledger-theme',
  authed: 'ledger-authed',
  role: 'ledger-role',
  escalatedCount: 'ledger-escalated-count',
  pitstop: (path) => `ledger-ps-${path}`,
}

export const storage = {
  getTheme: () => localStorage.getItem(KEY.theme),
  setTheme: (v) => localStorage.setItem(KEY.theme, v),

  isAuthed: () => !!localStorage.getItem(KEY.authed),
  setAuthed: () => localStorage.setItem(KEY.authed, '1'),
  clearAuth: () => {
    localStorage.removeItem(KEY.authed)
    localStorage.removeItem(KEY.role)
  },

  getRole: () => localStorage.getItem(KEY.role),
  setRole: (r) => localStorage.setItem(KEY.role, r),

  getEscalatedCount: () => parseInt(localStorage.getItem(KEY.escalatedCount) || '3'),

  getPitstop: (path) => localStorage.getItem(KEY.pitstop(path)),
  setPitstop: (path, v) => localStorage.setItem(KEY.pitstop(path), v),
}
