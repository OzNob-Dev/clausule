import { expect, test } from '@playwright/test'

const bootstrap = {
  user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
  profile: {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    mobile: '+61 400 000 000',
    jobTitle: 'Engineer',
    department: 'Platform',
  },
  security: { authenticatorAppConfigured: true, authenticatedWithOtp: true, ssoConfigured: false },
}

test.use({ viewport: { width: 1440, height: 1200 } })

test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('clausule_dev_accexx', 'granted')
  })
  await page.route('**/api/auth/bootstrap', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(bootstrap) })
  })
})

test('profile screen matches the saved visual baseline', async ({ page }) => {
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: /personal details/i })).toBeVisible()
  await expect(page.locator('main .be-inner')).toHaveScreenshot('profile-screen.png')
})
