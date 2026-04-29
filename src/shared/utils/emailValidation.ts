type EmailValidationResult = { valid: boolean; error: string | null; suggestion: string | null }

const COMMON_DOMAINS = [
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.com.au',
  'hotmail.com', 'hotmail.co.uk',
  'outlook.com', 'outlook.com.au',
  'icloud.com', 'me.com', 'mac.com',
  'live.com', 'msn.com', 'aol.com',
  'protonmail.com', 'proton.me',
  'hey.com', 'fastmail.com', 'fastmail.fm',
]

function levenshtein(a: string, b: string) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function closestDomain(typed: string) {
  const lower = typed.toLowerCase()
  if (COMMON_DOMAINS.includes(lower)) return null

  // Only run typo detection on single-dot domains (no subdomains, no .co.uk etc.)
  const dotCount = (lower.match(/\./g) || []).length
  if (dotCount !== 1) return null

  let best = null, bestDist = Infinity
  for (const d of COMMON_DOMAINS) {
    const dist = levenshtein(lower, d)
    // Require: within 2 edits, domain is at least 6 chars, and length diff ≤ 2 (avoids acme.com → me.com)
    if (dist < bestDist && dist <= 2 && lower.length >= 6 && Math.abs(lower.length - d.length) <= 2) {
      best = d
      bestDist = dist
    }
  }
  return best
}

/**
 * Returns { valid, error, suggestion }
 * error    — short human-readable problem string, or null
 * suggestion — corrected full email if a domain typo was detected, or null
 */
export function validateEmail(raw: string) {
  const email = (raw || '').trim()

  if (!email) return { valid: false, error: "Pop your email address in here and we'll take it from there.", suggestion: null }

  const atCount = (email.match(/@/g) || []).length
  if (atCount === 0) return { valid: false, error: "Looks like the @ is missing — every email needs one (e.g. you@gmail.com).", suggestion: null }
  if (atCount > 1)  return { valid: false, error: "Oops — there's more than one @ in there. Email addresses only get one!", suggestion: null }

  const [local, domain] = email.split('@')

  if (!local) return { valid: false, error: "Don't forget the part before the @ — that's your name or username.", suggestion: null }
  if (!domain) return { valid: false, error: "Almost! Add the part after the @, like gmail.com or outlook.com.", suggestion: null }

  const dotIdx = domain.lastIndexOf('.')
  if (dotIdx < 1) return { valid: false, error: `Hmm, "${domain}" doesn't look quite right. Try something like gmail.com.`, suggestion: null }

  const tld = domain.slice(dotIdx + 1)
  if (tld.length < 2) return { valid: false, error: "The ending looks a bit short — it should be something like .com or .co.uk.", suggestion: null }

  // Structural check passes — now look for domain typos
  const fix = closestDomain(domain)
  if (fix) {
    return {
      valid: false,
      error: null,
      suggestion: `${local}@${fix}`,
    }
  }

  return { valid: true, error: null, suggestion: null }
}
