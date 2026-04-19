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
        security: { authenticatorAppConfigured: false },
      }),
    })
  })

  await page.goto('/brag')

  await expect(page.getByText('Ada Lovelace')).toBeVisible()
  await expect(page.getByText('ada@example.com')).toBeVisible()
  await expect(page.getByText('AL').first()).toBeVisible()
})

test('brag settings shows authenticator empty state when not configured', async ({ page }) => {
  await page.route('**/api/auth/bootstrap', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
        profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
        security: { authenticatorAppConfigured: false },
      }),
    })
  })

  await page.goto('/brag/settings')

  await expect(page.getByText(/no authenticator app connected yet/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /set up/i })).toBeVisible()
})
