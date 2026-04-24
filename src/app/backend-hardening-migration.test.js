import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationPath = path.resolve(__dirname, '../../supabase/migrations/008_backend_hardening.sql')
const sql = readFileSync(migrationPath, 'utf8')

describe('backend hardening migration', () => {
  it('adds the missing profile trigger and active-subscription guardrail', () => {
    expect(sql).toContain('create trigger on_auth_user_created')
    expect(sql).toContain('idx_subscriptions_active_user_unique')
    expect(sql).toContain("where status in ('active', 'trialing')")
  })

  it('adds atomic auth functions and feedback RLS policies', () => {
    expect(sql).toContain('create or replace function public.consume_refresh_token')
    expect(sql).toContain('create or replace function public.consume_email_otp_code')
    expect(sql).toContain('create or replace function public.finalize_individual_subscription')
    expect(sql).toContain('alter table app_feedback enable row level security;')
    expect(sql).toContain('alter table app_feedback_replies enable row level security;')
    expect(sql).toContain('create policy "app_feedback: own read"')
    expect(sql).toContain('create policy "app_feedback_replies: own thread read"')
  })
})
