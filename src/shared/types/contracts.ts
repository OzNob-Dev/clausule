export type Role = 'employee' | 'manager'
export type AuthMethod = 'otp' | 'totp' | 'sso' | 'unknown'

export interface AuthUser {
  id: string
  email: string
  role: Role
}

export interface Profile {
  firstName: string
  lastName: string
  email: string
  mobile: string
  jobTitle: string
  department: string
}

export interface SecuritySnapshot {
  authenticatorAppConfigured: boolean
  authenticatedWithOtp: boolean
  ssoConfigured: boolean
}

export interface AuthBootstrap {
  user: AuthUser
  profile: Profile
  security: SecuritySnapshot
}

// TODO: expand when evidence model is finalised (attachments, metadata, etc.)
export interface BragEvidence {
  type: string
}

export interface BragEntry {
  id: string
  title: string
  body: string | null
  entry_date: string
  strength: string
  strength_hint: string
  created_at?: string | null
  updated_at?: string | null
  brag_entry_evidence?: BragEvidence[]
}

export interface SavedBragEntry {
  entry: BragEntry
  evidenceTypes: string[]
  files?: Array<{ id: string, name: string, size: number, type: string }>
}

export type LinkedInImportStatus = 'draft' | 'ready' | 'published' | 'skipped'
export type LinkedInImportKind = 'experience' | 'achievement' | 'recommendation' | 'skill'

export interface LinkedInImportItem {
  id: string
  kind: LinkedInImportKind
  title: string
  body: string | null
  organization: string | null
  entry_date: string | null
  evidence_type: string
  selected: boolean
  sort_order: number
  brag_entry_id?: string | null
  created_at?: string | null
}

export interface LinkedInImportSession {
  id: string
  user_id: string
  profile_name: string
  headline: string | null
  linkedin_url: string | null
  status: LinkedInImportStatus
  source_snapshot: Record<string, unknown>
  published_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  linkedin_import_items?: LinkedInImportItem[]
}

export interface FeedbackReply {
  id: string
  author_name?: string | null
  body: string
  from_team?: boolean
  created_at: string
}

export interface FeedbackThread {
  id: string
  category: string
  feeling: string
  subject: string
  message: string
  created_at: string
  replies: FeedbackReply[]
}

export interface SignupStep1Data {
  firstName: string
  lastName: string
  email: string
  agreed?: boolean
}
