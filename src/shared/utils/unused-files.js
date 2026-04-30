import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'])
const SCANNABLE_EXTENSIONS = new Set([...CODE_EXTENSIONS, '.css'])
const TEXT_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.css',
  '.txt',
  '.sh',
])
const ROUTE_BASENAMES = new Set(['page', 'layout', 'loading', 'error', 'not-found', 'head', 'route', 'template', 'default', 'global-error'])
const MANIFEST_FILES = new Set(['package.json', 'tsconfig.json', 'next.config.js', 'vitest.config.js', 'playwright.config.js'])
const ARTIFACT_SUFFIXES = ['.db', '.db-shm', '.db-wal']

const IMPORT_RE = /\b(?:import|export)\s+(?:type\s+)?(?:[\w*\s{},$]+\s+from\s+)?['"]([^'"]+)['"]/g
const REQUIRE_RE = /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g
const DYNAMIC_IMPORT_RE = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g
const NEW_URL_RE = /\bnew\s+URL\(\s*['"]([^'"]+)['"]\s*,\s*import\.meta\.url\s*\)/g
const CSS_IMPORT_RE = /@import\s+(?:url\(\s*)?['"]([^'"]+)['"](?:\s*\))?/g

function toPosix(input) {
  return input.split(path.sep).join('/')
}

function withoutExt(filePath) {
  const ext = path.extname(filePath)
  return ext ? filePath.slice(0, -ext.length) : filePath
}

function isTestFile(filePath) {
  return /\.test\.[^.]+$/.test(filePath) || /\.spec\.[^.]+$/.test(filePath) || /(^|\/)(__tests__|tests?)(\/|$)/.test(filePath)
}

function isCodeFile(filePath) {
  return CODE_EXTENSIONS.has(path.extname(filePath))
}

function isScannableFile(filePath) {
  return SCANNABLE_EXTENSIONS.has(path.extname(filePath))
}

function isTextFile(filePath) {
  return TEXT_EXTENSIONS.has(path.extname(filePath)) || MANIFEST_FILES.has(path.basename(filePath)) || filePath === 'AGENTS.md'
}

function isArtifact(filePath) {
  return filePath === 'skills/.DS_Store' || ARTIFACT_SUFFIXES.some((suffix) => filePath.endsWith(suffix))
}

function isRouteEntrypoint(filePath) {
  const posix = toPosix(filePath)
  if (!posix.startsWith('src/app/')) return false
  const base = path.basename(filePath, path.extname(filePath))
  return ROUTE_BASENAMES.has(base)
}

function classifyKind(filePath) {
  if (isArtifact(filePath)) return 'artifact'
  if (MANIFEST_FILES.has(path.basename(filePath))) return 'manifest'
  if (['postcss.config.js', 'tailwind.config.js', 'next-env.d.ts', 'package-lock.json', 'requirements.txt', 'skills-lock.json', 'skills.d'].includes(path.basename(filePath))) return 'manifest'
  if (path.basename(filePath).startsWith('favicon.') || filePath.startsWith('public/')) return 'asset'
  if (path.basename(filePath) === 'middleware.ts') return 'route'
  if (filePath === 'AGENTS.md' || filePath.startsWith('context/') || filePath.startsWith('skills/')) return 'meta'
  if (isTestFile(filePath)) return 'test'
  if (isRouteEntrypoint(filePath)) return 'route'
  if (filePath.startsWith('scripts/')) return 'script'
  if (filePath.endsWith('.md')) return 'doc'
  if (isCodeFile(filePath)) return 'source'
  return 'other'
}

function collectFilesFromGit(rootDir) {
  try {
    const output = execFileSync('git', ['-C', rootDir, 'ls-files', '-z'], { encoding: 'utf8' })
    return output ? output.split('\0').filter(Boolean) : []
  } catch {
    return null
  }
}

function collectFilesFromWalk(rootDir) {
  const files = []
  const skipDirs = new Set(['.git', 'node_modules', '.next', 'dist', 'coverage', 'playwright-report', 'test-results', '.turbo'])

  function walk(currentDir) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (skipDirs.has(entry.name)) continue
        walk(path.join(currentDir, entry.name))
        continue
      }

      if (entry.isFile()) files.push(toPosix(path.relative(rootDir, path.join(currentDir, entry.name))))
    }
  }

  walk(rootDir)
  return files
}

function collectFiles(rootDir) {
  if (!existsSync(path.join(rootDir, '.git'))) return collectFilesFromWalk(rootDir)
  return collectFilesFromGit(rootDir) ?? collectFilesFromWalk(rootDir)
}

function loadAliasMap(rootDir) {
  const tsconfigPath = path.join(rootDir, 'tsconfig.json')
  if (!existsSync(tsconfigPath)) return []

  const raw = JSON.parse(readFileSync(tsconfigPath, 'utf8'))
  const paths = raw?.compilerOptions?.paths ?? {}
  return Object.entries(paths).flatMap(([alias, targets]) => {
    const starIndex = alias.indexOf('*')
    const prefix = starIndex >= 0 ? alias.slice(0, starIndex) : alias
    return targets.map((target) => {
      const targetStarIndex = target.indexOf('*')
      const replacement = targetStarIndex >= 0 ? target.slice(0, targetStarIndex) : target
      return { prefix, replacement: replacement.replace(/^\.\//, '') }
    })
  })
}

function resolveSpecifier(specifier, importerFile, rootDir, aliases) {
  if (!specifier || specifier.startsWith('node:')) return null

  const importerDir = path.dirname(path.join(rootDir, importerFile))
  let basePath = null

  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    basePath = specifier.startsWith('/') ? path.join(rootDir, specifier.slice(1)) : path.resolve(importerDir, specifier)
  } else {
    const alias = aliases.find(({ prefix }) => specifier.startsWith(prefix))
    if (!alias) return null
    basePath = path.join(rootDir, alias.replacement + specifier.slice(alias.prefix.length))
  }

  const candidates = []
  const pushCandidate = (candidate) => {
    if (!candidate || candidates.includes(candidate)) return
    candidates.push(candidate)
  }

  pushCandidate(basePath)
  if (!path.extname(basePath)) {
    for (const ext of ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json', '.css']) pushCandidate(basePath + ext)
    for (const ext of ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']) pushCandidate(path.join(basePath, `index${ext}`))
  }

  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return toPosix(path.relative(rootDir, candidate))
  }

  return null
}

function extractSpecifiers(source) {
  return [
    ...source.matchAll(IMPORT_RE),
    ...source.matchAll(REQUIRE_RE),
    ...source.matchAll(DYNAMIC_IMPORT_RE),
    ...source.matchAll(NEW_URL_RE),
    ...source.matchAll(CSS_IMPORT_RE),
  ].map((match) => match[1])
}

function buildTextIndex(rootDir, files) {
  const contents = new Map()

  for (const file of files) {
    if (!isTextFile(file)) continue
    const abs = path.join(rootDir, file)
    try {
      contents.set(file, readFileSync(abs, 'utf8'))
    } catch {
      contents.set(file, '')
    }
  }

  return contents
}

function manualReferences(targetFile, textIndex) {
  const target = targetFile
  const exact = target.replace(/\\/g, '/')
  const hits = []

  for (const [file, content] of textIndex.entries()) {
    if (!content.includes(exact)) continue
    hits.push(file)
  }

  return hits
}

export function analyzeUnusedFiles(rootDir = process.cwd()) {
  const files = collectFiles(rootDir).filter((file) => !file.startsWith('.next/') && existsSync(path.join(rootDir, file)))
  const aliases = loadAliasMap(rootDir)
  const textIndex = buildTextIndex(rootDir, files)
  const inbound = new Map()

  for (const file of files) inbound.set(file, [])

  for (const importer of files) {
    if (!isScannableFile(importer)) continue

    const absImporter = path.join(rootDir, importer)
    let source = ''
    try {
      source = readFileSync(absImporter, 'utf8')
    } catch {
      continue
    }

    for (const specifier of extractSpecifiers(source)) {
      const resolved = resolveSpecifier(specifier, importer, rootDir, aliases)
      if (!resolved || !inbound.has(resolved)) continue
      inbound.get(resolved).push({ importer, kind: isTestFile(importer) ? 'test' : 'code' })
    }
  }

  const definitelyUnused = []
  const probablyUnused = []
  const intentional = []

  for (const file of files) {
    const kind = classifyKind(file)
    const refs = inbound.get(file) ?? []
    const codeRefs = refs.filter((ref) => ref.kind === 'code')
    const testRefs = refs.filter((ref) => ref.kind === 'test')
    const manualRefs = manualReferences(file, textIndex)

    if (kind === 'route' || kind === 'test' || kind === 'manifest' || kind === 'artifact' || kind === 'meta' || kind === 'doc' || kind === 'asset') {
      intentional.push({ file, kind, reason: kind === 'route' ? 'Next.js route convention' : kind === 'test' ? 'test artifact' : kind === 'manifest' ? 'project manifest' : kind === 'artifact' ? 'generated artifact' : kind === 'meta' ? 'repository metadata' : kind === 'asset' ? 'static asset' : 'documentation', refs, manualRefs })
      continue
    }

    if (codeRefs.length > 0) continue
    if (testRefs.length > 0) {
      probablyUnused.push({ file, kind, reason: 'only referenced by tests', refs, manualRefs })
      continue
    }
    if (manualRefs.length > 0) {
      intentional.push({ file, kind, reason: 'manual command or doc reference', refs, manualRefs })
      continue
    }

    definitelyUnused.push({ file, kind, reason: 'no inbound references found', refs, manualRefs })
  }

  return {
    rootDir,
    totalFiles: files.length,
    definitelyUnused,
    probablyUnused,
    intentional,
  }
}

export function formatUnusedFilesReport(report) {
  const lines = []
  lines.push('Unused file audit')
  lines.push(`Root: ${report.rootDir}`)
  lines.push(`Tracked files scanned: ${report.totalFiles}`)
  lines.push(`Definitely unused: ${report.definitelyUnused.length}`)
  lines.push(`Probably unused: ${report.probablyUnused.length}`)
  lines.push(`Intentional or convention-driven: ${report.intentional.length}`)

  const writeSection = (title, items) => {
    lines.push('')
    lines.push(title)
    if (!items.length) {
      lines.push('  none')
      return
    }

    for (const item of items) {
      lines.push(`  - ${item.file} (${item.reason})`)
    }
  }

  writeSection('Definitely unused', report.definitelyUnused)
  writeSection('Probably unused', report.probablyUnused)
  writeSection('Intentional or convention-driven', report.intentional)

  return lines.join('\n')
}
