import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC_ROOT = path.join(ROOT, 'src')
const LAYER_ORDER = ['atoms', 'molecules', 'organisms', 'templates', 'pages']
const EXCLUDED_FILE = /\.(test|spec)\.[jt]sx?$/i
const EXCLUDED_ROUTE_FILE = /(?:^|\/)(loading|error|global-error)\.[jt]sx?$/i
const COMPONENT_NAME_EXCEPTIONS = new Set(['AppShell', 'RailNav', 'SsoProviderIcon'])

const ATOMS = new Set([
  'Avatar',
  'Button',
  'CategoryDot',
  'CategoryPill',
  'SsoProviderIcon',
  'ThinkingDots',
])

const MOLECULES = new Set([
  'CodeEmail',
  'DigitRow',
  'SsoButtons',
  'SsoProviderButton',
  'SignupButtons',
  'SignupFormField',
  'TotpSecretBlock',
])

const TEMPLATES = new Set([
  'AppShell',
  'ResumeDocument',
])

const PREVIEW_KIND_BY_NAME = {
  Avatar: 'avatar',
  Button: 'button',
  CategoryDot: 'category',
  CategoryPill: 'category',
  CodeEmail: 'code-email',
  Modal: 'modal',
  PageLoader: 'page-loader',
  SsoProviderIcon: 'provider-icon',
  ThinkingDots: 'thinking-dots',
}

const NOTE_BY_NAME = {
  AppShell: 'Shared application scaffold with skip navigation and primary rail.',
  Avatar: 'Identity token used across profile and authoring surfaces.',
  Button: 'Primary action control with tone and size variants.',
  CategoryDot: 'Compact category marker for filter and legend use.',
  CategoryPill: 'Readable category badge for content classification.',
  CodeEmail: 'Verification email mock used in sign-in and MFA flows.',
  Modal: 'Accessible dialog with portal, focus trap, and escape handling.',
  PageLoader: 'Route-level loading surface with variant-specific animation.',
  RailNav: 'Primary app navigation rail for the protected shell.',
  SsoProviderIcon: 'Brand icon used by provider buttons and auth affordances.',
  ThinkingDots: 'Motion-safe loading indicator for busy states.',
}

function readEntries(dir, predicate) {
  const output = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'dist' || entry.name === 'coverage') continue
      output.push(...readEntries(path.join(dir, entry.name), predicate))
      continue
    }
    const filePath = path.join(dir, entry.name)
    if (predicate(filePath)) output.push(filePath)
  }
  return output
}

function normalize(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/')
}

function baseName(filePath) {
  return path.basename(filePath).replace(/\.[^.]+$/, '')
}

function humanize(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleCase(value) {
  return humanize(value)
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function stripGroups(segments) {
  return segments.filter((segment) => !segment.startsWith('('))
}

function ownerFromSource(sourcePath) {
  if (sourcePath.startsWith('src/shared/components/')) return 'shared'
  if (sourcePath.startsWith('src/features/')) {
    const [, , feature] = sourcePath.split('/')
    return feature ?? 'features'
  }
  if (sourcePath.startsWith('src/app/')) {
    const segments = sourcePath.split('/').slice(2, -1)
    const routeSegments = stripGroups(segments)
    if (routeSegments.length > 0) return routeSegments[0]
    const groupSegments = segments.filter((segment) => segment.startsWith('(')).map((segment) => segment.slice(1, -1))
    return groupSegments[0] ?? 'app'
  }
  return 'app'
}

function routeFromPageSource(sourcePath) {
  const segments = sourcePath.split('/').slice(2, -1)
  const routeSegments = stripGroups(segments)
  const route = `/${routeSegments.join('/')}`
  return route === '/' ? '/' : route.replace(/\/+/g, '/')
}

function labelFromSource(sourcePath) {
  if (sourcePath.endsWith('/page.jsx') || sourcePath.endsWith('/page.js') || sourcePath.endsWith('/page.tsx') || sourcePath.endsWith('/page.ts')) {
    const route = routeFromPageSource(sourcePath)
    if (route === '/') return sourcePath.includes('/(auth)/') ? 'Sign in page' : 'Home page'
    return `${titleCase(route.slice(1).replace(/\//g, ' '))} page`
  }
  return titleCase(baseName(sourcePath))
}

function layerFromName(name, sourcePath) {
  if (sourcePath.startsWith('src/app/') && /\/page\.[jt]sx?$/.test(sourcePath)) return 'pages'
  if (name === 'AppShell') return 'templates'
  if (TEMPLATES.has(name)) return 'templates'
  if (name.endsWith('Screen')) return 'pages'
  if (ATOMS.has(name) || /^(SsoProviderIcon|ThinkingDots)$/.test(name) || /(?:Icon|Pill|Dot|Avatar|Dots)$/.test(name)) return 'atoms'
  if (MOLECULES.has(name) || /(Button|Field|Email|Prompt|Progress|Row|Block|Chip|Form|Code|Select|Step)$/.test(name)) return 'molecules'
  if (/(Modal|Dialog|Panel|Section|Sidebar|Rail|Composer|Card|Tab|Shell|Center|Loader|State|BrandPanel)$/.test(name)) return 'organisms'
  if (COMPONENT_NAME_EXCEPTIONS.has(name)) return 'organisms'
  return sourcePath.includes('/components/') ? 'organisms' : 'pages'
}

function noteForEntry(name, layer) {
  return NOTE_BY_NAME[name] ?? ({
    atoms: 'Reusable atomic primitive.',
    molecules: 'Small reusable composition.',
    organisms: 'Larger reusable UI section.',
    templates: 'Page scaffold or layout shell.',
    pages: 'Route-level screen.',
  })[layer] ?? 'Reusable UI element.'
}

function previewKindForEntry(name, sourcePath, layer) {
  if (PREVIEW_KIND_BY_NAME[name]) return PREVIEW_KIND_BY_NAME[name]
  if (layer === 'pages') return 'page'
  if (name === 'AppShell') return 'app-shell'
  if (name === 'RailNav') return 'rail-nav'
  if (name === 'Modal') return 'modal'
  return 'generic'
}

function collectComponentSources() {
  const sources = []

  const sharedRoot = path.join(SRC_ROOT, 'shared', 'components')
  if (statSync(sharedRoot).isDirectory()) {
    sources.push(...readEntries(sharedRoot, (filePath) => {
      const sourcePath = normalize(filePath)
      return !EXCLUDED_FILE.test(sourcePath) && !EXCLUDED_ROUTE_FILE.test(sourcePath)
    }))
  }

  const featuresRoot = path.join(SRC_ROOT, 'features')
  if (statSync(featuresRoot).isDirectory()) {
    sources.push(...readEntries(featuresRoot, (filePath) => {
      const sourcePath = normalize(filePath)
      return sourcePath.includes('/components/') && !EXCLUDED_FILE.test(sourcePath) && !EXCLUDED_ROUTE_FILE.test(sourcePath)
    }))
  }

  const appRoot = path.join(SRC_ROOT, 'app')
  if (statSync(appRoot).isDirectory()) {
    sources.push(...readEntries(appRoot, (filePath) => {
      const sourcePath = normalize(filePath)
      return /\/page\.[jt]sx?$/.test(sourcePath) && !EXCLUDED_FILE.test(sourcePath) && !EXCLUDED_ROUTE_FILE.test(sourcePath)
    }))
  }

  return [...new Set(sources.map(normalize))].sort()
}

export function discoverComponentSources() {
  return collectComponentSources()
}

export function getComponentLibraryEntries() {
  return collectComponentSources().map((sourcePath) => {
    const name = baseName(sourcePath)
    const layer = layerFromName(name, sourcePath)
    return {
      id: sourcePath,
      sourcePath,
      label: labelFromSource(sourcePath),
      name,
      owner: ownerFromSource(sourcePath),
      layer,
      note: noteForEntry(name, layer),
      previewKind: previewKindForEntry(name, sourcePath, layer),
      route: sourcePath.startsWith('src/app/') ? routeFromPageSource(sourcePath) : null,
    }
  }).sort((left, right) => {
    const leftOrder = LAYER_ORDER.indexOf(left.layer)
    const rightOrder = LAYER_ORDER.indexOf(right.layer)
    if (leftOrder !== rightOrder) return leftOrder - rightOrder
    return left.label.localeCompare(right.label)
  })
}

export function getComponentLibrarySummary(entries = getComponentLibraryEntries()) {
  return {
    total: entries.length,
    layers: LAYER_ORDER.map((layer) => ({
      layer,
      count: entries.filter((entry) => entry.layer === layer).length,
    })),
    owners: [...new Set(entries.map((entry) => entry.owner))].sort(),
  }
}

export { LAYER_ORDER }
