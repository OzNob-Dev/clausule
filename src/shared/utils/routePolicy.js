import { MANAGER_ROUTES, ROUTES } from './routes'

export const PROTECTED_PREFIXES = [ROUTES.dashboard, ROUTES.settings, '/components', ROUTES.entries, ROUTES.profile, ROUTES.brag, ROUTES.mfaSetup]
export const AUTH_SHELL_PREFIXES = [ROUTES.login, ROUTES.register, ROUTES.signup, ROUTES.mfaSetup]
export const PUBLIC_SHELL_ROUTES = new Set([ROUTES.home, ROUTES.pricing])
export const MFA_EXEMPT_ROUTES = new Set([ROUTES.settings, ROUTES.bragSettings, ROUTES.mfaSetup])
export const AUTHOR_SHELL_ROUTES = new Set([
  ROUTES.brag,
  ROUTES.bragResume,
  ROUTES.bragLinkedin,
  ROUTES.bragFeedback,
  ROUTES.bragFeedbackHistory,
  ROUTES.bragSettings,
  ROUTES.profile,
])

export function isRouteMatch(pathname, route) {
  return pathname === route || pathname.startsWith(`${route}/`)
}

export function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some((prefix) => isRouteMatch(pathname, prefix))
}

export function isAuthShellPath(pathname) {
  return AUTH_SHELL_PREFIXES.some((prefix) => isRouteMatch(pathname, prefix))
}

export function isPublicShellPath(pathname) {
  return PUBLIC_SHELL_ROUTES.has(pathname)
}

export function isAuthorShellPath(pathname) {
  return AUTHOR_SHELL_ROUTES.has(pathname)
}

export function isMfaExemptPath(pathname) {
  return MFA_EXEMPT_ROUTES.has(pathname)
}

export function isManagerRoute(pathname) {
  return MANAGER_ROUTES.some((route) => isRouteMatch(pathname, route))
}
