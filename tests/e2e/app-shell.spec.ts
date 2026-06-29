import { expect, test } from '@playwright/test'

test('shows the wordmark', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '知行' })).toBeVisible()
})

test('drills into the seed tree and returns', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('button', { exact: true, name: '工作' })).toBeVisible()
  await page.getByRole('button', { exact: true, name: '工作' }).click()

  await expect(page.getByRole('heading', { name: '工作' })).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: '深度工作' })).toBeVisible()

  await page.getByRole('button', { name: '返回' }).click()
  await expect(page.getByRole('heading', { name: '知行' })).toBeVisible()
})

test('adds and renames a root card', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: '添加领域' }).click()
  await page.getByLabel('新卡片标题').fill('项目')
  await page.getByLabel('新卡片标题').press('Enter')

  await expect(page.getByRole('button', { exact: true, name: '项目' })).toBeVisible()

  await page.getByRole('button', { name: '编辑 项目' }).click()
  await page.getByLabel('标题', { exact: true }).fill('项目集')
  await page.getByRole('button', { name: '完成' }).click()

  await expect(page.getByRole('button', { exact: true, name: '项目集' })).toBeVisible()
})
