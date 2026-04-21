import { expect, test } from '@playwright/test'

const bootstrap = {
  user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
  profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
  security: { authenticatorAppConfigured: true, authenticatedWithOtp: true, ssoConfigured: false },
}

test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('clausule_dev_accexx', 'granted')
  })
  await page.route('**/api/auth/bootstrap', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(bootstrap) })
  })
})

test('public Next pages render their primary UI', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible()

  await page.goto('/signup')
  await expect(page.getByText(/create your account/i)).toBeVisible()

  await page.goto('/missing-page')
  await expect(page.getByText(/this entry doesn't exist/i)).toBeVisible()
})

test('protected Next pages render their primary UI', async ({ page }) => {
  const routes = [
    ['/dashboard', /dashboard/i],
    ['/entries', /search entries by name/i],
    ['/escalated', /entries escalated to HR/i],
    ['/settings', /signal settings/i],
    ['/profile', /personal details/i],
    ['/new-entry', /new file note/i],
    ['/edit-entry', /edit file note/i],
    ['/brag', /brag doc/i],
    ['/brag/feedback', /product feedback/i],
    ['/brag/settings', /security settings/i],
  ]

  for (const [route, text] of routes) {
    await page.goto(route)
    await expect(page.getByText(text).first()).toBeVisible()
  }
})
