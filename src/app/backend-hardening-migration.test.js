import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const hardeningPath = path.resolve(__dirname, '../../supabase/migrations/008_backend_hardening.sql')
const retryPath = path.resolve(__dirname, '../../supabase/migrations/009_retry_safety_and_consistency.sql')
const hardeningSql = readFileSync(hardeningPath, 'utf8')
const retrySql = readFileSync(retryPath, 'utf8')

describe('backend hardening migration', () => {
  it('adds the missing profile trigger and active-subscription guardrail', () => {
    expect(hardeningSql).toContain('create trigger on_auth_user_created')
    expect(hardeningSql).toContain('idx_subscriptions_active_user_unique')
    expect(hardeningSql).toContain("where status in ('active', 'trialing')")
  })

  it('adds atomic auth functions and feedback RLS policies', () => {
    expect(hardeningSql).toContain('create or replace function public.consume_refresh_token')
    expect(hardeningSql).toContain('create or replace function public.consume_email_otp_code')
    expect(hardeningSql).toContain('create or replace function public.finalize_individual_subscription')
    expect(hardeningSql).toContain('alter table app_feedback enable row level security;')
    expect(hardeningSql).toContain('alter table app_feedback_replies enable row level security;')
    expect(hardeningSql).toContain('create policy "app_feedback: own read"')
    expect(hardeningSql).toContain('create policy "app_feedback_replies: own thread read"')
  })

  it('adds retry-safe backend operations and normalized email invariants', () => {
    expect(retrySql).toContain('create extension if not exists citext;')
    expect(retrySql).toContain('alter column email type citext')
    expect(retrySql).toContain('create table if not exists backend_operations')
    expect(retrySql).toContain('create or replace function public.begin_backend_operation')
    expect(retrySql).toContain('create or replace function public.complete_backend_operation')
    expect(retrySql).toContain('add column if not exists retry_key text')
    expect(retrySql).toContain('idx_subscriptions_retry_key_unique')
  })
})
