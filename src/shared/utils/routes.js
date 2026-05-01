export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  register: '/register',
  mfaSetup: '/mfa-setup',
  pricing: '/pricing',
  brag: '/brag',
  bragResume: '/brag/resume',
  bragLinkedin: '/brag/linkedin',
  bragFeedback: '/brag/feedback',
  bragFeedbackHistory: '/brag/feedback/history',
  bragSettings: '/brag/settings',
  settings: '/settings',
  profile: '/profile',
  dashboard: '/dashboard',
  entries: '/entries',
  privacy: '/privacy',
  terms: '/terms',
}

/** Routes that require the 'manager' role. */
export const MANAGER_ROUTES = [ROUTES.dashboard, ROUTES.entries]

export function homePathForRole(role) {
  return role === 'employee' ? ROUTES.brag : ROUTES.dashboard
}
