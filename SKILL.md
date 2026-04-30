---
name: backend-architecture
description: >
  Principal guidance for backend service layer design, repository pattern, dependency
  injection, domain-driven design boundaries, module organization, and when to split
  a monolith. Load when designing new backend features, reviewing service layer structure,
  establishing module boundaries, or evaluating architectural patterns.
---

# Backend Architecture — Principal Standards

## Layered Architecture
```
HTTP Layer        → Route handlers (thin — parse, validate, respond)
Service Layer     → Business logic (orchestration, rules, decisions)
Repository Layer  → Data access (queries, persistence, mapping)
Domain Layer      → Pure domain objects, types, value objects
Infrastructure    → External services (email, storage, payments, queues)
```

Each layer depends only on layers below it. Never skip layers. Never call infrastructure directly from route handlers.

## Service Layer

### Responsibilities
- Orchestrates repositories and infrastructure
- Enforces business rules
- Owns transaction boundaries
- Returns domain objects or Result types — never raw DB rows

```typescript
// src/features/auth/server/auth.service.ts
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly emailService: EmailService,
    private readonly hashService: HashService,
  ) {}

  async register(input: RegisterInput): Promise<Result<User, AuthError>> {
    // Business rule: email must be unique
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) return err(new ConflictError('Email already registered'));

    // Domain logic: hash before persist
    const hashedPassword = await this.hashService.hash(input.password);

    // Persist
    const user = await this.userRepo.create({
      email: input.email,
      name: input.name,
      passwordHash: hashedPassword,
    });

    // Side effect after durable write
    await this.emailService.sendVerification(user);

    return ok(user);
  }
}
```

### Service Rules
- Services are **stateless**. No instance-level mutable state.
- Services own **transaction boundaries**. Start and commit/rollback in service, not repository.
- Services return **domain types**, never raw DB records or ORMs.
- Side effects (email, notifications, webhooks) happen **after** the durable write succeeds.
- Services never import from route files or other features' services directly.
- One service per domain area. Never a `UtilityService` or `HelperService`.

## Repository Pattern

### Responsibilities
- All database access isolated here
- Maps DB records → domain objects
- Abstracts query complexity from services
- Single source of truth for data access patterns

```typescript
// src/features/users/server/user.repository.ts
export class UserRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findById(id: UserId): Promise<User | null> {
    const { data, error } = await this.db
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('id', id)
      .eq('deleted_at', null)  // soft-delete filter
      .maybeSingle();

    if (error) throw new DatabaseError('Failed to fetch user', { cause: error });
    return data ? this.toDomain(data) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const { data, error } = await this.db
      .from('users')
      .select('id, email, name, role, password_hash, created_at')
      .eq('email', email)
      .maybeSingle();

    if (error) throw new DatabaseError('Failed to fetch user by email', { cause: error });
    return data ? this.toDomain(data) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const { data, error } = await this.db
      .from('users')
      .insert(this.toRecord(input))
      .select('id, email, name, role, created_at')
      .single();

    if (error) throw new DatabaseError('Failed to create user', { cause: error });
    return this.toDomain(data);
  }

  // Private: DB record → domain object mapping
  private toDomain(record: UserRecord): User {
    return {
      id: record.id as UserId,
      email: record.email as Email,
      name: record.name,
      role: record.role as UserRole,
      createdAt: new Date(record.created_at),
    };
  }
}
```

### Repository Rules
- One repository per aggregate root (not per table).
- Never expose raw DB types outside the repository.
- Never put business logic in repositories. Logic = service. Data access = repository.
- Column names stay inside the repository (snake_case DB ↔ camelCase domain).
- Repositories throw `DatabaseError` for infrastructure failures — services handle them.

## Domain Objects

```typescript
// Value objects — immutable, comparable by value
type UserId = string & { __brand: 'UserId' };
type Email = string & { __brand: 'Email' };
type Money = { amount: number; currency: string };

// Entities — identity by ID
interface User {
  id: UserId;
  email: Email;
  name: string;
  role: UserRole;
  createdAt: Date;
}

// Domain events — what happened
interface UserRegistered {
  type: 'USER_REGISTERED';
  userId: UserId;
  email: Email;
  occurredAt: Date;
}
```

## Dependency Injection

For Next.js App Router: factory functions over DI containers (containers add complexity without proportional benefit at app scale).

```typescript
// src/features/auth/server/index.ts — factory
import { createClient } from '@/shared/utils/supabase/server';

export async function createAuthService(): Promise<AuthService> {
  const db = await createClient();
  const userRepo = new UserRepository(db);
  const sessionRepo = new SessionRepository(db);
  const emailService = new EmailService();
  const hashService = new HashService();
  return new AuthService(userRepo, sessionRepo, emailService, hashService);
}

// In server action or route handler
const authService = await createAuthService();
const result = await authService.register(input);
```

For testing: inject mocks via constructor — no magic required.

```typescript
// Test
const mockUserRepo = { findByEmail: vi.fn(), create: vi.fn() } as MockUserRepo;
const service = new AuthService(mockUserRepo, mockSessionRepo, mockEmail, mockHash);
```

## Module Boundaries

```
src/features/[feature]/
  server/
    [feature].service.ts       ← business logic
    [feature].repository.ts    ← data access
    [feature].types.ts         ← domain types for this feature
    index.ts                   ← factory + public exports
  ui/                          ← client-side components
  hooks/                       ← client-side hooks
  schemas/                     ← shared Zod schemas
```

Cross-feature access: services never import from another feature's internals. Shared domain types live in `src/shared/types/`.

## When to Split a Monolith

Stay monolith when:
- Team <10 engineers
- Deployment complexity would outweigh benefit
- No clear domain boundaries yet
- Shared DB transactions are common

Consider splitting when:
- A domain scales independently (different load profile)
- A domain has a completely separate team
- A domain needs a different tech stack
- A domain's failure must not affect others

Split by: extracting to a separate Next.js app, not microservices. Microservices at startup scale = operational debt without benefit.

## Anti-Patterns (Instant Rejection)
- Business logic in route handlers
- DB queries in route handlers
- Services importing from route files
- God service: `UserService` handling auth + billing + notifications
- Repositories containing business logic
- Raw DB records crossing service boundaries
- Services directly calling other features' repositories
- Stateful services (instance-level mutable fields)
- Infrastructure calls (email, webhooks) before durable DB write
