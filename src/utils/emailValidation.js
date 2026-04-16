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

function levenshtein(a, b) {
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

function closestDomain(typed) {
  const lower = typed.toLowerCase()
  if (COMMON_DOMAINS.includes(lower)) return null

  let best = null, bestDist = Infinity
  for (const d of COMMON_DOMAINS) {
    const dist = levenshtein(lower, d)
    // Only suggest if within 2 edits and the domain isn't too short
    if (dist < bestDist && dist <= 2 && typed.length >= 5) {
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
export function validateEmail(raw) {
  const email = (raw || '').trim()

  if (!email) return { valid: false, error: 'Enter your email address.', suggestion: null }

  const atCount = (email.match(/@/g) || []).length
  if (atCount === 0) return { valid: false, error: 'Missing an @ — email addresses need one.', suggestion: null }
  if (atCount > 1)  return { valid: false, error: 'There can only be one @ in an email address.', suggestion: null }

  const [local, domain] = email.split('@')

  if (!local) return { valid: false, error: 'Add something before the @.', suggestion: null }
  if (!domain) return { valid: false, error: 'Add a domain after the @, like gmail.com.', suggestion: null }

  const dotIdx = domain.lastIndexOf('.')
  if (dotIdx < 1) return { valid: false, error: `"${domain}" doesn't look like a valid domain.`, suggestion: null }

  const tld = domain.slice(dotIdx + 1)
  if (tld.length < 2) return { valid: false, error: 'The part after the last dot looks too short.', suggestion: null }

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
