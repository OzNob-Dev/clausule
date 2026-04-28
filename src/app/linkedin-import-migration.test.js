import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const linkedinImportsPath = path.resolve(__dirname, '../../supabase/migrations/024_linkedin_imports.sql')
const linkedinImportsSql = readFileSync(linkedinImportsPath, 'utf8')

describe('linkedin import migration', () => {
  it('adds the sessions and imported items tables', () => {
    expect(linkedinImportsSql).toContain('create table linkedin_import_sessions')
    expect(linkedinImportsSql).toContain('create table linkedin_import_items')
    expect(linkedinImportsSql).toContain('alter table linkedin_import_sessions enable row level security;')
    expect(linkedinImportsSql).toContain('alter table linkedin_import_items enable row level security;')
    expect(linkedinImportsSql).toContain('linkedin_import_sessions: owner')
    expect(linkedinImportsSql).toContain('linkedin_import_items: owner')
  })
})
