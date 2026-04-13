/**
 * Build report — prints a size summary of every asset in dist/assets,
 * including the savings from gzip and brotli compressed variants.
 *
 * Run automatically via: npm run build:optimized
 */

import { readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const DIST = new URL('../dist/assets', import.meta.url).pathname

const RESET  = '\x1b[0m'
const BOLD   = '\x1b[1m'
const GREEN  = '\x1b[32m'
const CYAN   = '\x1b[36m'
const YELLOW = '\x1b[33m'
const DIM    = '\x1b[2m'

function kb(bytes) {
  return (bytes / 1024).toFixed(1).padStart(7) + ' KB'
}

function pct(original, compressed) {
  const saving = ((1 - compressed / original) * 100).toFixed(0)
  return `${saving}% smaller`
}

let files
try {
  files = readdirSync(DIST)
} catch {
  console.error('dist/assets not found — run `npm run build` first.')
  process.exit(1)
}

// Group: original → gz → br
const assets = {}
for (const file of files) {
  const base = file.replace(/\.(gz|br)$/, '')
  assets[base] ??= {}
  if (file.endsWith('.gz'))      assets[base].gz   = file
  else if (file.endsWith('.br')) assets[base].br   = file
  else                           assets[base].orig  = file
}

const originals = Object.entries(assets)
  .filter(([, v]) => v.orig)
  .sort(([a], [b]) => a.localeCompare(b))

console.log(`\n${BOLD}Build output — compressed asset report${RESET}`)
console.log('─'.repeat(72))
console.log(
  `${'File'.padEnd(40)}${'Original'.padStart(10)}${'Gzip'.padStart(10)}${'Brotli'.padStart(10)}`
)
console.log('─'.repeat(72))

let totalOrig = 0, totalGz = 0, totalBr = 0

for (const [base, variants] of originals) {
  const origSize = statSync(join(DIST, variants.orig)).size
  const gzSize   = variants.gz ? statSync(join(DIST, variants.gz)).size  : null
  const brSize   = variants.br ? statSync(join(DIST, variants.br)).size  : null

  totalOrig += origSize
  if (gzSize) totalGz += gzSize
  if (brSize) totalBr += brSize

  const ext    = extname(base)
  const colour = ['.js', '.mjs'].includes(ext) ? CYAN : ext === '.css' ? YELLOW : DIM

  console.log(
    `${colour}${base.slice(0, 39).padEnd(40)}${RESET}` +
    `${kb(origSize)}` +
    `${gzSize ? GREEN + kb(gzSize) + RESET : '         —'}` +
    `${brSize ? GREEN + kb(brSize) + RESET : '         —'}`
  )
}

console.log('─'.repeat(72))
console.log(
  `${BOLD}${'TOTAL'.padEnd(40)}${kb(totalOrig)}` +
  `${totalGz ? GREEN + kb(totalGz) + RESET : '         —'}` +
  `${totalBr ? GREEN + kb(totalBr) + RESET : '         —'}${RESET}`
)

if (totalGz) {
  console.log(`\n${GREEN}Gzip saves   ${pct(totalOrig, totalGz)}${RESET}`)
}
if (totalBr) {
  console.log(`${GREEN}Brotli saves ${pct(totalOrig, totalBr)}${RESET}`)
}
console.log()
