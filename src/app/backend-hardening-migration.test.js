import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const hardeningPath = path.resolve(__dirname, '../../supabase/migrations/008_backend_hardening.sql')
const retryPath = path.resolve(__dirname, '../../supabase/migrations/009_retry_safety_and_consistency.sql')
const cleanupPath = path.resolve(__dirname, '../../supabase/migrations/010_backend_operation_cleanup.sql')
const replayWindowPath = path.resolve(__dirname, '../../supabase/migrations/011_backend_operation_replay_window.sql')
const distributedReliabilityPath = path.resolve(__dirname, '../../supabase/migrations/012_distributed_reliability.sql')
const bragAtomicWritesPath = path.resolve(__dirname, '../../supabase/migrations/013_brag_entry_atomic_writes.sql')
const authDeliveryHardeningPath = path.resolve(__dirname, '../../supabase/migrations/014_auth_delivery_and_order_hardening.sql')
const ssoStateAndReconciliationPath = path.resolve(__dirname, '../../supabase/migrations/015_sso_state_and_email_reconciliation.sql')
const passkeyAuthenticationPath = path.resolve(__dirname, '../../supabase/migrations/016_passkey_authentication.sql')
const functionHardeningPath = path.resolve(__dirname, '../../supabase/migrations/020_function_privilege_and_search_path_hardening.sql')
const hardeningSql = readFileSync(hardeningPath, 'utf8')
const retrySql = readFileSync(retryPath, 'utf8')
const cleanupSql = readFileSync(cleanupPath, 'utf8')
const replayWindowSql = readFileSync(replayWindowPath, 'utf8')
const distributedReliabilitySql = readFileSync(distributedReliabilityPath, 'utf8')
const bragAtomicWritesSql = readFileSync(bragAtomicWritesPath, 'utf8')
const authDeliveryHardeningSql = readFileSync(authDeliveryHardeningPath, 'utf8')
const ssoStateAndReconciliationSql = readFileSync(ssoStateAndReconciliationPath, 'utf8')
const passkeyAuthenticationSql = readFileSync(passkeyAuthenticationPath, 'utf8')
const functionHardeningSql = readFileSync(functionHardeningPath, 'utf8')

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

  it('makes backend operations explicitly internal and adds cleanup support', () => {
    expect(cleanupSql).toContain('alter table backend_operations disable row level security;')
    expect(cleanupSql).toContain('cleanup_backend_operations')
    expect(cleanupSql).toContain("interval '30 minutes'")
    expect(cleanupSql).toContain("interval '1 day'")
    expect(cleanupSql).toContain("operation_type in ('register', 'subscribe', 'login_otp', 'login_totp', 'refresh', 'sso')")
  })

  it('limits completed backend-operation replay windows to a short recovery window', () => {
    expect(replayWindowSql).toContain("interval '10 minutes'")
    expect(replayWindowSql).toContain("interval '6 hours'")
    expect(replayWindowSql).toContain('create or replace function public.begin_backend_operation')
    expect(replayWindowSql).toContain('create or replace function cleanup_backend_operations()')
  })

  it('adds distributed throttling, passkey challenge persistence, and cleanup scheduling', () => {
    expect(distributedReliabilitySql).toContain('create table if not exists auth_rate_limits')
    expect(distributedReliabilitySql).toContain('create table if not exists passkey_challenges')
    expect(distributedReliabilitySql).toContain('create or replace function public.consume_rate_limit')
    expect(distributedReliabilitySql).toContain('create or replace function public.store_passkey_challenge')
    expect(distributedReliabilitySql).toContain('create or replace function public.consume_passkey_challenge')
    expect(distributedReliabilitySql).toContain('create extension if not exists pg_cron;')
    expect(distributedReliabilitySql).toContain("cleanup_passkey_challenges_job")
    expect(distributedReliabilitySql).toContain("cleanup_auth_rate_limits_job")
  })

  it('adds atomic brag entry write functions', () => {
    expect(bragAtomicWritesSql).toContain('create or replace function public.create_brag_entry_with_evidence')
    expect(bragAtomicWritesSql).toContain('create or replace function public.update_brag_entry_with_evidence')
    expect(bragAtomicWritesSql).toContain('grant execute on function public.create_brag_entry_with_evidence')
    expect(bragAtomicWritesSql).toContain('grant execute on function public.update_brag_entry_with_evidence')
  })

  it('gates OTP verification on successful delivery', () => {
    expect(authDeliveryHardeningSql).toContain('add column if not exists delivered_at timestamptz')
    expect(authDeliveryHardeningSql).toContain('where used_at is null and delivered_at is not null')
    expect(authDeliveryHardeningSql).toContain('and otp.delivered_at is not null')
    expect(authDeliveryHardeningSql).toContain('create or replace function public.consume_email_otp_code')
  })

  it('stores SSO state server-side and schedules cleanup', () => {
    expect(ssoStateAndReconciliationSql).toContain('create table if not exists sso_auth_states')
    expect(ssoStateAndReconciliationSql).toContain('create or replace function public.create_sso_auth_state')
    expect(ssoStateAndReconciliationSql).toContain('create or replace function public.consume_sso_auth_state')
    expect(ssoStateAndReconciliationSql).toContain("cleanup_sso_auth_states_job")
  })

  it('adds one-time passkey authentication challenges and login replay support', () => {
    expect(passkeyAuthenticationSql).toContain('create table if not exists passkey_auth_challenges')
    expect(passkeyAuthenticationSql).toContain('create or replace function public.store_passkey_auth_challenge')
    expect(passkeyAuthenticationSql).toContain('create or replace function public.consume_passkey_auth_challenge')
    expect(passkeyAuthenticationSql).toContain("cleanup_passkey_auth_challenges_job")
    expect(passkeyAuthenticationSql).toContain("operation_type in ('register', 'subscribe', 'login_otp', 'login_totp', 'login_passkey', 'refresh', 'sso')")
  })

  it('locks down default function privileges and pins definer function search paths', () => {
    expect(functionHardeningSql).toContain('revoke create on schema public from public;')
    expect(functionHardeningSql).toContain('revoke execute on all functions in schema public from public;')
    expect(functionHardeningSql).toContain('alter default privileges in schema public revoke execute on functions from anon, authenticated;')
    expect(functionHardeningSql).toContain('alter function public.consume_email_otp_code(text, text, timestamptz) set search_path = public, extensions, pg_temp;')
    expect(functionHardeningSql).toContain('alter function public.consume_sso_auth_state(text, text, timestamptz) set search_path = public, pg_temp;')
    expect(functionHardeningSql).toContain('alter function public.consume_passkey_auth_challenge(text, timestamptz) set search_path = public, pg_temp;')
  })
})
