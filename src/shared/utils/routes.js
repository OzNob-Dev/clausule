export const ROUTES = {
  brag: '/brag',
  bragFeedback: '/brag/feedback',
  bragSettings: '/brag/settings',
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
