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
  files: Array<{ name: string }>
}

export interface FeedbackReply {
  id: string
  body: string
  created_at: string
}

export interface FeedbackThread {
  id: string
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

export interface SignupStep2Data {
  cardName: string
  cardNum: string
  expiry: string
  cvc: string
}
