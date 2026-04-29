import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { analyzeUnusedFiles } from './unused-files.js'

function write(root, file, content) {
  const full = path.join(root, file)
  mkdirSync(path.dirname(full), { recursive: true })
  writeFileSync(full, content)
}

describe('analyzeUnusedFiles', () => {
  it('separates unused, test-only, and convention-driven files', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'unused-files-'))

    write(root, 'package.json', JSON.stringify({ name: 'fixture', scripts: { audit: 'node scripts/used.js' } }, null, 2))
    write(root, 'tsconfig.json', JSON.stringify({ compilerOptions: { baseUrl: '.', paths: { '@shared/*': ['./src/shared/*'] } } }, null, 2))
    write(root, 'scripts/used.js', 'export const used = true\n')
    write(root, 'scripts/orphan.js', 'export const orphan = true\n')
    write(root, 'src/shared/helper.js', 'export const helper = true\n')
    write(root, 'src/shared/test-only.js', 'export const testOnly = true\n')
    write(root, 'src/shared/tokens.css', ':root { --token: 1; }\n')
    write(root, 'src/shared/globals.css', '@import "./tokens.css";\n')
    write(root, 'src/consumer.test.js', "import { testOnly } from '@shared/test-only.js'\nvoid testOnly\n")
    write(root, 'src/consumer.js', "import { helper } from '@shared/helper.js'\nimport '@shared/globals.css'\nvoid helper\n")
    write(root, 'src/app/layout.jsx', 'export default function Layout({ children }) { return children }\n')
    write(root, 'src/unused.js', 'export const unused = true\n')

    const report = analyzeUnusedFiles(root)

    expect(report.definitelyUnused.map((item) => item.file)).toEqual(expect.arrayContaining(['scripts/orphan.js', 'src/unused.js']))
    expect(report.probablyUnused.map((item) => item.file)).toEqual(['src/shared/test-only.js'])
    expect(report.intentional.map((item) => item.file)).toEqual(expect.arrayContaining(['scripts/used.js', 'src/app/layout.jsx']))
    expect([...report.definitelyUnused, ...report.probablyUnused, ...report.intentional].map((item) => item.file)).not.toContain('src/shared/tokens.css')
  })
})
