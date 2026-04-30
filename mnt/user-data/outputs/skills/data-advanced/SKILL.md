---
name: data-advanced
description: >
  Advanced database guidance covering query optimization and EXPLAIN ANALYZE,
  soft delete patterns, audit logging and event sourcing lite, multi-tenancy
  schema strategies, read replicas, and data consistency patterns. Load alongside
  the data skill for complex schema design, performance debugging, or multi-tenant architecture.
---

# Advanced Data Patterns — Principal Standards

## Query Optimization

### EXPLAIN ANALYZE Workflow
```sql
-- Always use EXPLAIN (ANALYZE, BUFFERS) — not just EXPLAIN
-- EXPLAIN alone doesn't execute. ANALYZE does. BUFFERS shows cache hits.
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.id, u.email, p.title, p.created_at
FROM users u
JOIN posts p ON p.user_id = u.id
WHERE u.org_id = 'org_123'
  AND p.status = 'published'
ORDER BY p.created_at DESC
LIMIT 20;
```

**Reading the output:**
```
Seq Scan on posts          → BAD on large tables. Add index.
Index Scan using idx_...   → GOOD. Using index.
Index Only Scan            → BEST. All columns from index, no heap fetch.
Hash Join / Merge Join     → Join algorithm. Hash = smaller table fits in memory.
Rows Removed by Filter: N  → High N = poor selectivity. Better index needed.
Buffers: hit=X read=Y      → hit = from cache, read = from disk. Want high hit ratio.
```

**Red flags:**
- `Seq Scan` on table with >10k rows
- `cost=0..99999` (estimated row count wildly off → run `ANALYZE tablename`)
- `Rows Removed by Filter` much larger than rows returned
- `Sort` on large result set without index on ORDER BY column

### Table Statistics
```sql
-- Update statistics when query plans are wrong after bulk operations
ANALYZE tablename;

-- Full vacuum + stats update (reclaim dead tuples + update stats)
VACUUM ANALYZE tablename;

-- Check table bloat and last vacuum
SELECT schemaname, tablename, n_live_tup, n_dead_tup, last_vacuum, last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

### Composite Index Ordering
```sql
-- Query: WHERE org_id = ? AND status = 'active' ORDER BY created_at DESC
-- Wrong index order (status low cardinality first = poor selectivity)
CREATE INDEX idx_posts_bad ON posts (status, org_id, created_at);

-- Right index order (most selective/filtered first)
CREATE INDEX idx_posts_good ON posts (org_id, status, created_at DESC);
-- org_id filters most rows, status refines, created_at enables index-only sort
```

### Partial Indexes (High Value)
```sql
-- Index only the rows queries actually touch
CREATE INDEX idx_posts_active ON posts (org_id, created_at DESC)
WHERE status = 'published' AND deleted_at IS NULL;
-- Dramatically smaller index. Only used for active published posts queries.

-- Index for pending jobs
CREATE INDEX idx_jobs_pending ON jobs (created_at)
WHERE status = 'pending';
```

### Covering Indexes (Index-Only Scans)
```sql
-- INCLUDE non-filtered columns to enable index-only scan
CREATE INDEX idx_users_email_covering ON users (email)
INCLUDE (id, name, role);
-- Query: SELECT id, name, role FROM users WHERE email = ?
-- → Index-only scan. Zero heap access. Fastest possible.
```

## Soft Deletes

### Pattern
```sql
ALTER TABLE users ADD COLUMN deleted_at timestamptz;
CREATE INDEX idx_users_not_deleted ON users (id) WHERE deleted_at IS NULL;
```

```typescript
// Repository always filters deleted records
async findById(id: UserId): Promise<User | null> {
  return db.from('users')
    .select(USER_COLUMNS)
    .eq('id', id)
    .is('deleted_at', null)  // ALWAYS include this
    .maybeSingle();
}

// Soft delete
async delete(id: UserId): Promise<void> {
  await db.from('users')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);  // idempotent
}

// Hard delete for compliance (GDPR right to erasure)
async purge(id: UserId): Promise<void> {
  // Anonymize PII columns before hard delete
  await db.from('users')
    .update({
      email: `deleted-${id}@purged`,
      name: 'Deleted User',
      deleted_at: new Date().toISOString(),
    })
    .eq('id', id);
}
```

### Soft Delete Trade-offs
```
BENEFITS:
  ✓ Undo accidental deletes
  ✓ Audit trail (who deleted, when)
  ✓ FK references remain valid
  ✓ Required for: legal hold, billing history, multi-user data ownership

COSTS:
  ✗ Every query needs deleted_at IS NULL filter (easy to forget)
  ✗ Unique constraints broken (email can be "freed" but soft-deleted record blocks reuse)
  ✗ Table grows unbounded without archival
  ✗ Performance degrades over time without partial index

UNIQUE CONSTRAINT FIX:
  -- Partial unique index excludes deleted rows
  CREATE UNIQUE INDEX uq_users_email_active ON users (email)
  WHERE deleted_at IS NULL;
```

## Audit Logging

### Append-Only Audit Log Table
```sql
CREATE TABLE audit_log (
  id          bigserial PRIMARY KEY,
  table_name  text NOT NULL,
  record_id   uuid NOT NULL,
  action      text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  actor_id    uuid REFERENCES users(id),
  actor_ip    inet,
  old_data    jsonb,
  new_data    jsonb,
  diff        jsonb,  -- computed: keys that changed
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_record ON audit_log (table_name, record_id, created_at DESC);
CREATE INDEX idx_audit_log_actor ON audit_log (actor_id, created_at DESC);

-- Immutable: no UPDATE or DELETE allowed on audit_log
CREATE RULE no_update_audit AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_log DO INSTEAD NOTHING;
```

```sql
-- Trigger to auto-populate audit log
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_log (table_name, record_id, action, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_audit
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
```

### Application-Level Audit Log (More Control)
```typescript
// When you need actor context (user who made the change)
async function updateUser(
  actorId: UserId,
  targetId: UserId,
  changes: UpdateUserInput,
  ip: string,
): Promise<User> {
  const before = await userRepo.findById(targetId);
  const after = await userRepo.update(targetId, changes);

  await auditLogRepo.create({
    tableName: 'users',
    recordId: targetId,
    action: 'UPDATE',
    actorId,
    actorIp: ip,
    oldData: before,
    newData: after,
    diff: computeDiff(before, after),
  });

  return after;
}
```

## Multi-Tenancy Schema Strategies

### Strategy A: Row-Level (Recommended for SaaS)
```sql
-- Add org_id to every tenant-scoped table
ALTER TABLE posts ADD COLUMN org_id uuid NOT NULL REFERENCES organizations(id);

-- RLS enforces tenant isolation automatically
CREATE POLICY "tenant_isolation" ON posts
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

-- Composite indexes always start with org_id
CREATE INDEX idx_posts_org ON posts (org_id, created_at DESC);
```

Pros: single DB/schema, simple operations, RLS provides hard isolation.
Cons: cross-tenant queries harder, must always include org_id in indexes.

### Strategy B: Schema-Per-Tenant
```sql
-- Each tenant gets own schema
CREATE SCHEMA tenant_abc123;
SET search_path TO tenant_abc123;
CREATE TABLE posts (...); -- same structure, isolated data
```

Pros: complete isolation, easy tenant deletion (DROP SCHEMA), no RLS needed.
Cons: migration complexity (must run on every schema), connection pooling harder, Supabase doesn't support natively.

### Strategy C: Database-Per-Tenant
Only for regulated industries with strict data residency requirements. Operational overhead very high.

**Recommendation: Row-level with RLS for most SaaS applications.**

### Tenant Context Pattern
```typescript
// Always pass org context explicitly — never derive from global state
async function createPost(
  orgId: OrgId,
  userId: UserId,
  input: CreatePostInput,
): Promise<Post> {
  // org_id set explicitly, not assumed
  return postRepo.create({ ...input, orgId, createdBy: userId });
}

// Query always scoped to org
async function findOrgPosts(orgId: OrgId, options: QueryOptions): Promise<Post[]> {
  return db.from('posts')
    .select(POST_COLUMNS)
    .eq('org_id', orgId)  // never omit this
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 20);
}
```

## Read Replicas

```typescript
// Write to primary, read from replica
const primaryDb = createClient({ connectionString: process.env.DB_PRIMARY_URL });
const replicaDb = createClient({ connectionString: process.env.DB_REPLICA_URL });

// Reads — replica (eventual consistency acceptable)
async function findRecentPosts(orgId: OrgId): Promise<Post[]> {
  return replicaDb.from('posts')...
}

// Writes — always primary
async function createPost(input: CreatePostInput): Promise<Post> {
  return primaryDb.from('posts')...
}

// Read-after-write — must use primary
async function createAndReturnPost(input: CreatePostInput): Promise<Post> {
  const post = await primaryDb.from('posts').insert(input).select().single();
  return post; // use primary result, not replica (replication lag)
}
```

Replication lag: typically <100ms but can spike. Never use replica for: auth verification, payment state, anything requiring fresh consistency.

## Anti-Patterns (Instant Rejection)
- Soft delete without partial index (full table scan on deleted_at IS NULL)
- Unique constraint without partial index to exclude soft-deleted rows
- Audit log table that allows UPDATE or DELETE
- Multi-tenant queries without org_id filter (cross-tenant data leak)
- No index starting with org_id on tenant-scoped tables
- Using replica for auth or payment reads
- Running EXPLAIN without ANALYZE (wrong cost estimates)
- Skipping VACUUM on tables with heavy UPDATE/DELETE workload
- Storing audit actor context in a trigger (triggers lack request context)
- Unbounded audit log growth without archival strategy
