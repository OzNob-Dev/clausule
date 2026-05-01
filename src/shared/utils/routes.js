export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  register: '/register',
  mfaSetup: '/mfa-setup',
  pricing: '/pricing',
  brag: '/brag',
  resume: '/resume',
  linkedin: '/linkedin',
  feedback: '/feedback',
  feedbackHistory: '/feedback/history',
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
