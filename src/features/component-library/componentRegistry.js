import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC_ROOT = path.join(ROOT, 'src')
const FILE_EXT_RE = /\.(jsx|js|tsx|ts)$/
const EXCLUDED_FILE_RE = /\.(test|spec)\.[jt]sx?$/
const LAYER_ORDER = ['atoms', 'molecules', 'organisms', 'templates', 'pages']

const FILE_OVERRIDES = new Map([
  ['src/features/signup/components/SignupButtons.jsx', new Map([
    ['CtaBtn', { layer: 'atoms', previewKind: 'button' }],
    ['BackBtn', { layer: 'atoms', previewKind: 'button' }],
  ])],
  ['src/features/signup/components/SignupFormField.jsx', new Map([
    ['FieldLabel', { layer: 'atoms', previewKind: 'field' }],
    ['FieldInput', { layer: 'atoms', previewKind: 'field' }],
  ])],
  ['src/features/signup/components/SignupIcons.jsx', new Map([
    ['CheckIcon', { layer: 'atoms', previewKind: 'icon' }],
    ['ArrowIcon', { layer: 'atoms', previewKind: 'icon' }],
    ['BackIcon', { layer: 'atoms', previewKind: 'icon' }],
  ])],
  ['src/features/auth/components/SignInBrandPanel.jsx', new Map([
    ['BrandBugIcon', { layer: 'atoms', previewKind: 'icon' }],
    ['SignInBrandPanel', { layer: 'organisms', previewKind: 'panel' }],
  ])],
])

const ENTRY_OVERRIDES = new Map([
  ['AppShell', { layer: 'templates', previewKind: 'shell' }],
  ['Avatar', { layer: 'atoms', previewKind: 'avatar' }],
  ['BackBtn', { layer: 'atoms', previewKind: 'button' }],
  ['BrandBugIcon', { layer: 'atoms', previewKind: 'icon' }],
  ['Button', { layer: 'atoms', previewKind: 'button' }],
  ['BragEmptyState', { layer: 'organisms', previewKind: 'card' }],
  ['BragIdentitySidebar', { layer: 'organisms', previewKind: 'rail' }],
  ['BragRail', { layer: 'organisms', previewKind: 'rail' }],
  ['BragSettingsDangerZone', { layer: 'organisms', previewKind: 'panel' }],
  ['CheckIcon', { layer: 'atoms', previewKind: 'icon' }],
  ['CtaBtn', { layer: 'atoms', previewKind: 'button' }],
  ['CategoryDot', { layer: 'atoms', previewKind: 'badge' }],
  ['CategoryPill', { layer: 'atoms', previewKind: 'badge' }],
  ['CodeEmail', { layer: 'molecules', previewKind: 'email' }],
  ['ComponentLibraryScreen', { layer: 'pages', previewKind: 'page' }],
  ['DeleteAccountDialog', { layer: 'organisms', previewKind: 'dialog' }],
  ['DigitRow', { layer: 'molecules', previewKind: 'otp' }],
  ['EntryCard', { layer: 'organisms', previewKind: 'card' }],
  ['EntryComposer', { layer: 'organisms', previewKind: 'composer' }],
  ['EntryComposerParts', { layer: 'molecules', previewKind: 'group' }],
  ['EvidenceTypeGroup', { layer: 'molecules', previewKind: 'group' }],
  ['EvidenceUploadNotice', { layer: 'molecules', previewKind: 'notice' }],
  ['FeedbackCenter', { layer: 'organisms', previewKind: 'panel' }],
  ['FeedbackComposer', { layer: 'organisms', previewKind: 'composer' }],
  ['FieldInput', { layer: 'atoms', previewKind: 'field' }],
  ['FieldLabel', { layer: 'atoms', previewKind: 'field' }],
  ['MfaLoginAppStep', { layer: 'organisms', previewKind: 'otp' }],
  ['MfaLoginEmailStep', { layer: 'organisms', previewKind: 'otp' }],
  ['MfaOtpStep', { layer: 'organisms', previewKind: 'otp' }],
  ['MfaSecuritySection', { layer: 'organisms', previewKind: 'panel' }],
  ['MfaSuccessStep', { layer: 'pages', previewKind: 'page' }],
  ['MfaTotpStep', { layer: 'organisms', previewKind: 'panel' }],
  ['Modal', { layer: 'organisms', previewKind: 'dialog' }],
  ['PageLoader', { layer: 'atoms', previewKind: 'loader' }],
  ['ProfileScreen', { layer: 'pages', previewKind: 'page' }],
  ['RailNav', { layer: 'organisms', previewKind: 'rail' }],
  ['ResumeDocument', { layer: 'templates', previewKind: 'document' }],
  ['ResumeTab', { layer: 'organisms', previewKind: 'panel' }],
  ['SignInBrandPanel', { layer: 'organisms', previewKind: 'panel' }],
  ['SignInEmailForm', { layer: 'organisms', previewKind: 'form' }],
  ['SignUpPrompt', { layer: 'molecules', previewKind: 'link' }],
  ['SignupAside', { layer: 'templates', previewKind: 'panel' }],
  ['SignupButtons', { layer: 'molecules', previewKind: 'group' }],
  ['SignupDoneScreen', { layer: 'pages', previewKind: 'page' }],
  ['SignupFormField', { layer: 'molecules', previewKind: 'field' }],
  ['SignupPanelSummary', { layer: 'molecules', previewKind: 'card' }],
  ['SignupPlanPanelContent', { layer: 'molecules', previewKind: 'panel' }],
  ['SignupProgress', { layer: 'molecules', previewKind: 'loader' }],
  ['SignupScreen', { layer: 'pages', previewKind: 'page' }],
  ['SignupStepAccount', { layer: 'organisms', previewKind: 'form' }],
  ['SignupStepDone', { layer: 'pages', previewKind: 'page' }],
  ['SignupStepPayment', { layer: 'pages', previewKind: 'page' }],
  ['SsoButtons', { layer: 'molecules', previewKind: 'group' }],
  ['SsoProviderButton', { layer: 'molecules', previewKind: 'link' }],
  ['SsoProviderIcon', { layer: 'atoms', previewKind: 'icon' }],
  ['SsoStatusSection', { layer: 'organisms', previewKind: 'panel' }],
  ['ThinkingDots', { layer: 'atoms', previewKind: 'loader' }],
  ['TotpSecretBlock', { layer: 'organisms', previewKind: 'panel' }],
  ['TotpSetupPanel', { layer: 'organisms', previewKind: 'panel' }],
  ['VerifyChangesModal', { layer: 'organisms', previewKind: 'dialog' }],
])

const PREVIEW_KIND_BY_LAYER = {
  atoms: 'generic',
  molecules: 'generic',
  organisms: 'generic',
  templates: 'shell',
  pages: 'page',
}

const ATOM_NAME_RE = /(Icon|Avatar|Button|Btn|Pill|Dot|Badge|Chip|Input|Label|Loader|Dots)$/i
const MOLECULE_NAME_RE = /(Group|Buttons|Prompt|Row|FormField|Field|Notice|Progress|Summary|SecretBlock|ProviderButton|SsoButtons|PlanPanelContent)$/i
const ORGANISM_NAME_RE = /(Modal|Dialog|Sidebar|Rail|EmptyState|Composer|Section|Panel|Card|Center|Tab|Tabs|Security|BrandPanel|Status|Document|SettingsDangerZone|SetupPanel|Screen)$/i

function normalizePath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/')
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

function pascalCase(value) {
  return humanize(value)
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function isComponentFile(filePath) {
  return FILE_EXT_RE.test(filePath) && !EXCLUDED_FILE_RE.test(filePath)
}

function walkFiles(dir, predicate) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'coverage' || entry.name === 'dist') continue
      out.push(...walkFiles(path.join(dir, entry.name), predicate))
      continue
    }

    const filePath = path.join(dir, entry.name)
    if (predicate(filePath)) out.push(filePath)
  }
  return out
}

function discoverCandidateFiles() {
  const files = []

  const sharedRoot = path.join(SRC_ROOT, 'shared', 'components')
  if (readdirSync(sharedRoot, { withFileTypes: true })) {
    files.push(...walkFiles(sharedRoot, isComponentFile))
  }

  const featuresRoot = path.join(SRC_ROOT, 'features')
  files.push(...walkFiles(featuresRoot, (filePath) => {
    if (!isComponentFile(filePath)) return false
    const normalized = normalizePath(filePath)
    return normalized.includes('/components/') || /\/(.*Screen)\.[jt]sx?$/.test(normalized)
  }))

  const appRoot = path.join(SRC_ROOT, 'app')
  files.push(...walkFiles(appRoot, (filePath) => {
    const normalized = normalizePath(filePath)
    return isComponentFile(filePath) && /\/page\.[jt]sx?$/.test(normalized)
  }))

  return [...new Set(files.map(normalizePath))].sort()
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
}

function extractExportNames(source, filePath) {
  const text = stripComments(source)
  const names = []
  const seen = new Set()
  const add = (name, exportKind = 'named') => {
    if (!name || seen.has(name)) return
    seen.add(name)
    names.push({ exportName: name, exportKind })
  }

  for (const match of text.matchAll(/export\s+default\s+function\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
    add(match[1], 'default')
  }

  if (/export\s+default\s+function\s*\(/.test(text) && !names.some((entry) => entry.exportKind === 'default')) {
    add(pascalCase(path.basename(filePath).replace(/\.[^.]+$/, '')), 'default')
  }

  for (const match of text.matchAll(/export\s+function\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
    add(match[1], 'named')
  }

  for (const match of text.matchAll(/export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g)) {
    add(match[1], 'named')
  }

  for (const match of text.matchAll(/export\s*{\s*([^}]+)\s*}/g)) {
    for (const part of match[1].split(',')) {
      const token = part.trim()
      if (!token) continue
      const aliasMatch = token.match(/^(?:[A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/)
      add(aliasMatch?.[1] ?? token, 'named')
    }
  }

  return names
}

function routeFromPagePath(sourcePath) {
  const segments = sourcePath.split('/').slice(2, -1)
  const routeSegments = segments.filter((segment) => !segment.startsWith('('))
  const route = `/${routeSegments.join('/')}`
  return route === '/' ? '/' : route.replace(/\/+/g, '/')
}

function ownerFromSource(sourcePath) {
  if (sourcePath.startsWith('src/shared/components/')) return 'shared'
  if (sourcePath.startsWith('src/features/')) {
    const segments = sourcePath.split('/')
    return segments[2] ?? 'features'
  }
  if (sourcePath.startsWith('src/app/')) {
    const route = routeFromPagePath(sourcePath)
    return route.split('/')[1] ?? 'app'
  }
  return 'app'
}

function layerFromEntry({ exportName, sourcePath }) {
  const fileOverride = FILE_OVERRIDES.get(sourcePath)?.get(exportName)
  if (fileOverride?.layer) return fileOverride.layer
  const entryOverride = ENTRY_OVERRIDES.get(exportName)
  if (entryOverride?.layer) return entryOverride.layer

  if (sourcePath.startsWith('src/app/') && /\/page\.[jt]sx?$/.test(sourcePath)) return 'pages'
  if (/Screen$/.test(exportName)) return 'pages'
  if (/^AppShell$/.test(exportName) || /Shell$/.test(exportName)) return 'templates'
  if (ATOM_NAME_RE.test(exportName) && !MOLECULE_NAME_RE.test(exportName) && !ORGANISM_NAME_RE.test(exportName)) return 'atoms'
  if (MOLECULE_NAME_RE.test(exportName) && !ORGANISM_NAME_RE.test(exportName)) return 'molecules'
  if (ORGANISM_NAME_RE.test(exportName)) return 'organisms'
  return sourcePath.includes('/components/') ? 'organisms' : 'pages'
}

function previewKindFromEntry({ exportName, sourcePath, layer }) {
  const fileOverride = FILE_OVERRIDES.get(sourcePath)?.get(exportName)
  if (fileOverride?.previewKind) return fileOverride.previewKind
  const entryOverride = ENTRY_OVERRIDES.get(exportName)
  if (entryOverride?.previewKind) return entryOverride.previewKind
  return PREVIEW_KIND_BY_LAYER[layer] ?? 'generic'
}

function notesForEntry(entry) {
  const { exportName, layer } = entry
  const base = {
    atoms: 'Reusable atomic primitive.',
    molecules: 'Small composed control.',
    organisms: 'Larger reusable UI section.',
    templates: 'Layout scaffold or shell.',
    pages: 'Route-level screen.',
  }[layer] ?? 'Reusable UI element.'

  if (/Button|Btn$/.test(exportName)) return 'Action control used across flows.'
  if (/Link|Prompt/.test(exportName)) return 'Navigation or conversion affordance.'
  if (/Icon$/.test(exportName)) return 'Icon-only primitive used in compact UI.'
  if (/Card$/.test(exportName)) return 'Card surface for grouped content.'
  if (/Field|Input|Label/.test(exportName)) return 'Form control primitive.'
  if (/Modal|Dialog/.test(exportName)) return 'Accessible dialog surface.'
  if (/Rail|Sidebar/.test(exportName)) return 'Persistent navigation shell element.'
  if (/Loader|Dots/.test(exportName)) return 'Busy-state indicator.'
  return base
}

function displayNameForEntry({ exportName, sourcePath }) {
  if (sourcePath.startsWith('src/app/') && /\/page\.[jt]sx?$/.test(sourcePath)) {
    return `${titleCase(routeFromPagePath(sourcePath).slice(1).replace(/\//g, ' '))} page`
  }
  return titleCase(exportName)
}

function makeEntry({ sourcePath, exportName, exportKind }) {
  const layer = layerFromEntry({ sourcePath, exportName })
  const fileOverride = FILE_OVERRIDES.get(sourcePath)?.get(exportName)
  const entryOverride = ENTRY_OVERRIDES.get(exportName)

  return {
    id: `${sourcePath}#${exportName}`,
    sourcePath,
    exportName,
    exportKind,
    displayName: displayNameForEntry({ sourcePath, exportName }),
    owner: ownerFromSource(sourcePath),
    layer,
    previewKind: previewKindFromEntry({ sourcePath, exportName, layer }),
    note: notesForEntry({ sourcePath, exportName, layer }),
    route: sourcePath.startsWith('src/app/') ? routeFromPagePath(sourcePath) : null,
    kindHint: fileOverride?.previewKind ?? entryOverride?.previewKind ?? null,
    fileExportCount: null,
  }
}

function buildEntries() {
  const entries = []

  for (const sourcePath of discoverCandidateFiles()) {
    const raw = readFileSync(path.join(ROOT, sourcePath), 'utf8')
    const exports = extractExportNames(raw, sourcePath)
    for (const symbol of exports) {
      entries.push(makeEntry({ sourcePath, ...symbol }))
    }
  }

  const counts = entries.reduce((acc, entry) => {
    acc.set(entry.sourcePath, (acc.get(entry.sourcePath) ?? 0) + 1)
    return acc
  }, new Map())

  return entries
    .map((entry) => ({ ...entry, fileExportCount: counts.get(entry.sourcePath) ?? 1 }))
    .sort((left, right) => {
      const leftOrder = LAYER_ORDER.indexOf(left.layer)
      const rightOrder = LAYER_ORDER.indexOf(right.layer)
      if (leftOrder !== rightOrder) return leftOrder - rightOrder
      if (left.sourcePath !== right.sourcePath) return left.sourcePath.localeCompare(right.sourcePath)
      return left.exportName.localeCompare(right.exportName)
    })
}

export function discoverComponentExports() {
  return buildEntries()
}

export function discoverComponentSources() {
  return [...new Set(discoverComponentExports().map((entry) => entry.sourcePath))].sort()
}

export function getComponentLibraryEntries() {
  return discoverComponentExports()
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
