import { expect, test } from '@playwright/test'

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('clausule_dev_accexx', 'granted')
  })
})

test('sign in skips auth session checks when no session cookie exists', async ({ page }) => {
  const authRequests = []
  await page.route('**/api/auth/{me,refresh}', async (route) => {
    authRequests.push(route.request().url())
    await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Unauthenticated' }) })
  })

  await page.goto('/')

  await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  expect(authRequests).toEqual([])
})

test('sign in checks the session when the session cookie exists', async ({ context, page }) => {
  await context.addCookies([{ name: 'clausule_session', value: '1', domain: '127.0.0.1', path: '/' }])
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { role: 'employee' } }),
    })
  })

  await page.goto('/')

  await expect(page).toHaveURL(/\/brag/)
})

test('new visitor can route from sign in to signup when email is unknown', async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Unauthenticated' }) })
  })
  await page.route('**/api/auth/check-email', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ exists: false }) })
  })

  await page.goto('/')
  await page.getByLabel('Email').fill('newperson@example.com')
  await page.getByRole('button', { name: /login/i }).click()

  await expect(page).toHaveURL(/\/signup\?email=newperson%40example\.com/)
  await expect(page.getByText(/create your account/i)).toBeVisible()
  await expect(page.getByPlaceholder('you@email.com')).toHaveValue('newperson@example.com')
  await expect(page.getByPlaceholder('you@email.com')).toHaveAttribute('readonly', '')
  await expect(page.getByText(/or sign up with email/i)).toHaveCount(0)
})

test('login button submits after the email field blurs', async ({ page }) => {
  let checks = 0
  await page.route('**/api/auth/check-email', async (route) => {
    checks += 1
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ exists: false }) })
  })

  await page.goto('/')
  await page.getByLabel('Email').fill('blur@example.com')
  await page.locator('.si-left').click()
  await page.getByRole('button', { name: /login/i }).click()

  await expect(page).toHaveURL(/\/signup\?email=blur%40example\.com/)
  expect(checks).toBe(1)
})

test('login does not send users to signup when email check fails', async ({ page }) => {
  await page.route('**/api/auth/check-email', async (route) => {
    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Email check failed' }) })
  })

  await page.goto('/')
  await page.getByLabel('Email').fill('paid@example.com')
  await page.getByRole('button', { name: /login/i }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
})

test('login sends known non-SSO accounts to the authenticator app screen', async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Unauthenticated' }) })
  })
  await page.route('**/api/auth/check-email', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ exists: true, isActive: true, isDeleted: false, hasMfa: true, hasSso: false, ssoProvider: null, hasPaid: true }),
    })
  })
  await page.route('**/api/auth/send-code', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  })

  await page.goto('/')
  await page.getByLabel('Email').fill('otp@example.com')
  await page.getByRole('button', { name: /login/i }).click()

  await expect(page.getByText('Enter your code')).toBeVisible()
  await expect(page.getByText(/open your authenticator app/i)).toBeVisible()
  await expect(page.getByText(/signing in as/i)).toBeVisible()
  await expect(page.getByText('ot***@example.com')).toBeVisible()
  await expect(page.getByText('otp@example.com')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /verify authentication code/i })).toBeDisabled()
})

test('login sends known OTP accounts to the email code screen', async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Unauthenticated' }) })
  })
  await page.route('**/api/auth/check-email', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ exists: true, isActive: true, isDeleted: false, hasMfa: false, hasSso: false, ssoProvider: null, hasPaid: true }),
    })
  })
  await page.route('**/api/auth/send-code', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  })

  await page.goto('/')
  await page.getByLabel('Email').fill('otp@example.com')
  await page.getByRole('button', { name: /login/i }).click()

  await expect(page.getByText('Verify your code')).toBeVisible()
  await expect(page.getByText('ot***@example.com')).toBeVisible()
  await expect(page.getByLabel('Example of the email you received')).toBeVisible()
  await expect(page.getByText('otp@example.com')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /verify your code/i })).toBeDisabled()
})

test('login routes known SSO accounts through SSO provider sign-in', async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Unauthenticated' }) })
  })
  await page.route('**/api/auth/check-email', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ exists: true, isActive: true, isDeleted: false, hasMfa: false, hasSso: true, ssoProvider: 'google', hasPaid: true }),
    })
  })
  await page.route('**/api/auth/sso/google', async (route) => {
    await route.fulfill({ status: 204 })
  })

  await page.goto('/')
  await page.getByLabel('Email').fill('sso@example.com')
  const ssoRequest = page.waitForRequest('**/api/auth/sso/google')
  await page.getByRole('button', { name: /login/i }).click()

  expect((await ssoRequest).url()).toContain('/api/auth/sso/google')
})

test('signup preloads SSO profile fields from redirect params', async ({ page }) => {
  await page.goto('/signup?email=ada%40example.com&firstName=Ada&lastName=Lovelace&sso=google')

  await expect(page.getByText(/create your account/i)).toBeVisible()
  await expect(page.getByPlaceholder('Jordan')).toHaveValue('Ada')
  await expect(page.getByPlaceholder('Ellis')).toHaveValue('Lovelace')
  await expect(page.getByPlaceholder('you@email.com')).toHaveValue('ada@example.com')
})

test('protected brag page hydrates profile and shows shared avatar initials', async ({ page }) => {
  await page.route('**/api/auth/bootstrap', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
        profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
        security: { authenticatorAppConfigured: true, authenticatedWithOtp: true, ssoConfigured: true },
      }),
    })
  })

  await page.goto('/brag')

  await expect(page.getByText('Ada Lovelace')).toBeVisible()
  await expect(page.getByText('ada@example.com')).toBeVisible()
  await expect(page.getByText('AL').first()).toBeVisible()
})

test('protected app redirects to brag settings until authenticator setup is complete', async ({ page }) => {
  await page.route('**/api/auth/bootstrap', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
        profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
        security: { authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: true },
      }),
    })
  })

  await page.goto('/brag')

  await expect(page).toHaveURL(/\/brag\/settings/)
  await expect(page.getByText(/authenticator setup required/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /brag doc/i })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /settings/i })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible()
})

test('brag settings highlights authenticator setup even when SSO is configured', async ({ page }) => {
  await page.route('**/api/auth/bootstrap', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
        profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
        security: { authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: true },
      }),
    })
  })

  await page.goto('/brag/settings')

  await expect(page.getByText('Single sign-on')).toBeVisible()
  await expect(page.getByText(/authenticator setup required/i)).toBeVisible()
  await expect(page.locator('.bss-totp-empty--required')).toBeVisible()
  await expect(page.getByLabel('Authenticator app is not set up')).toHaveCount(0)
  await expect(page.getByText('Empty')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /set up/i })).toBeVisible()
})

test('protected app redirects after non-OTP auth until authenticator setup is complete', async ({ page }) => {
  await page.route('**/api/auth/bootstrap', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
        profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
        security: { authenticatorAppConfigured: false, authenticatedWithOtp: false, ssoConfigured: true },
      }),
    })
  })

  await page.goto('/brag')

  await expect(page).toHaveURL(/\/brag\/settings/)
  await expect(page.getByText(/authenticator setup required/i)).toBeVisible()
  await expect(page.locator('.bss-totp-empty--required')).toBeVisible()
  await expect(page.getByRole('button', { name: /brag doc/i })).toHaveCount(0)
})

test('brag settings shows active two-factor status when authenticator MFA is enabled', async ({ page }) => {
  await page.route('**/api/auth/bootstrap', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
        profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
        security: { authenticatorAppConfigured: true, authenticatedWithOtp: true, ssoConfigured: true },
      }),
    })
  })

  await page.goto('/brag/settings')

  await expect(page.getByText('Single sign-on')).toBeVisible()
  await expect(page.getByText('Two-factor authentication', { exact: true })).toBeVisible()
  await expect(page.getByText('Authenticator app', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Authenticator app is active')).toHaveText('Active')
  await expect(page.getByText(/authenticator setup required/i)).toHaveCount(0)
  await expect(page.getByRole('button', { name: /set up/i })).toHaveCount(0)
})

test('brag settings shows active SSO status for enabled providers', async ({ page }) => {
  await page.route('**/api/auth/bootstrap', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
        profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
        security: { authenticatorAppConfigured: false, authenticatedWithOtp: false, ssoConfigured: true },
      }),
    })
  })

  await page.goto('/brag/settings')

  const row = page.locator('.bss-sso-row').filter({ hasText: 'Google' })
  await expect(page.getByText('Single sign-on')).toBeVisible()
  await expect(row).toContainText('Ada Lovelace')
  await expect(row).toContainText('ada@example.com')
  await expect(row.getByLabel('Google single sign-on is active')).toHaveText('Active')
})

test('brag settings hides active SSO status for non-SSO accounts', async ({ page }) => {
  await page.route('**/api/auth/bootstrap', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
        profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
        security: { authenticatorAppConfigured: false, authenticatedWithOtp: false, ssoConfigured: false },
      }),
    })
  })

  await page.goto('/brag/settings')

  await expect(page.getByText('Single sign-on')).toHaveCount(0)
  await expect(page.locator('.bss-sso-row')).toHaveCount(0)
})
