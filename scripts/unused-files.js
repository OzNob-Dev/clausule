import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { analyzeUnusedFiles, formatUnusedFilesReport } from '../src/shared/utils/unused-files.js'

function parseArgs(argv) {
  let rootDir = process.cwd()

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--root') rootDir = path.resolve(String(argv[i + 1] ?? rootDir)), i += 1
  }

  return { rootDir }
}

function isDirectRun() {
  return process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
}

export function main(argv = process.argv.slice(2)) {
  const { rootDir } = parseArgs(argv)
  const report = analyzeUnusedFiles(rootDir)
  console.log(formatUnusedFilesReport(report))
}

if (isDirectRun()) main()
