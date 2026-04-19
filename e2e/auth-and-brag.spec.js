import { expect, test } from '@playwright/test'

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('clausule_dev_accexx', 'granted')
  })
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
  await page.getByRole('button', { name: /send code/i }).click()

  await expect(page).toHaveURL(/\/signup\?email=newperson%40example\.com/)
  await expect(page.getByText(/create your account/i)).toBeVisible()
  await expect(page.getByPlaceholder('you@email.com')).toHaveValue('newperson@example.com')
  await expect(page.getByPlaceholder('you@email.com')).toHaveAttribute('readonly', '')
  await expect(page.getByText(/or sign up with email/i)).toHaveCount(0)
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
        security: { authenticatorAppConfigured: true, authenticatedWithOtp: true },
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
        security: { authenticatorAppConfigured: false, authenticatedWithOtp: false },
      }),
    })
  })

  await page.goto('/brag')

  await expect(page).toHaveURL(/\/brag\/settings/)
  await expect(page.getByText(/authenticator setup required/i)).toBeVisible()
  await expect(page.locator('.bss-totp-empty--required')).toBeVisible()
  await expect(page.getByRole('button', { name: /brag doc/i })).toHaveCount(0)
})

test('brag settings hides two-factor setup when authenticator MFA is enabled', async ({ page }) => {
  await page.route('**/api/auth/bootstrap', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
        profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
        security: { authenticatorAppConfigured: true, authenticatedWithOtp: true },
      }),
    })
  })

  await page.goto('/brag/settings')

  await expect(page.getByText('Single sign-on')).toBeVisible()
  await expect(page.getByText('Two-factor authentication', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Authenticator app', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /reconfigure/i })).toHaveCount(0)
})

test('brag settings shows active SSO status for enabled providers', async ({ page }) => {
  await page.route('**/api/auth/bootstrap', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
        profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
        security: { authenticatorAppConfigured: false, authenticatedWithOtp: false },
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
