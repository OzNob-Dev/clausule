export const ROUTES = {
  brag: '/brag',
  bragFeedback: '/brag/feedback',
  bragSettings: '/brag/settings',
  profile: '/profile',
  dashboard: '/dashboard',
}

export function homePathForRole(role) {
  return role === 'employee' ? ROUTES.brag : ROUTES.dashboard
}
