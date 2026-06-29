import { expect, test } from '@playwright/test'

test('shows the wordmark', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '知行' })).toBeVisible()
})

test('drills into the seed tree and returns', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: '工作' })).toBeVisible()
  await page.getByRole('button', { name: '工作' }).click()

  await expect(page.getByRole('heading', { name: '工作' })).toBeVisible()
  await expect(page.getByRole('button', { name: '深度工作' })).toBeVisible()

  await page.getByRole('button', { name: '返回' }).click()
  await expect(page.getByRole('heading', { name: '知行' })).toBeVisible()
})
