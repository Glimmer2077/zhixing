import { expect, test, type Locator, type Page } from '@playwright/test'

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

test('reorders root cards by dragging the sort handle', async ({ page }) => {
  await page.goto('/')

  const workCard = page.getByRole('button', { exact: true, name: '工作' })
  const dailyCard = page.getByRole('button', { exact: true, name: '日常' })
  await expect(workCard).toBeVisible()
  await expect(dailyCard).toBeVisible()

  await dragBetween(
    page,
    page.getByRole('button', { name: '排序 工作' }),
    page.getByRole('button', { name: '排序 日常' }),
  )

  await expect.poll(() => cardOrder(page, '日常', '工作')).toBe('日常-first')
})

test('moves a child card to the root level', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { exact: true, name: '工作' }).click()
  await expect(page.getByRole('heading', { name: '工作' })).toBeVisible()

  await page.getByRole('button', { name: '编辑 深度工作' }).click()
  await page.getByLabel('移动到').selectOption('__root__')
  await page.getByRole('button', { name: '完成' }).click()

  await expect(page.getByRole('button', { exact: true, name: '深度工作' })).toBeHidden()

  await page.getByRole('button', { name: '返回' }).click()
  await expect(page.getByRole('button', { exact: true, name: '深度工作' })).toBeVisible()
})

test('keeps added cards after reload', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: '添加领域' }).click()
  await page.getByLabel('新卡片标题').fill('长期项目')
  await page.getByLabel('新卡片标题').press('Enter')
  await expect(page.getByRole('button', { exact: true, name: '长期项目' })).toBeVisible()

  await page.reload()

  await expect(page.getByRole('button', { exact: true, name: '长期项目' })).toBeVisible()
})

test('keeps the current card after reload', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { exact: true, name: '工作' }).click()
  await expect(page.getByRole('heading', { name: '工作' })).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: '深度工作' })).toBeVisible()

  await page.reload()

  await expect(page.getByRole('heading', { name: '工作' })).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: '深度工作' })).toBeVisible()
})

test('imports a JSON tree from settings', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: '设置' }).click()
  await page.getByLabel('导入 JSON').setInputFiles({
    name: 'zhixing.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({
        version: 1,
        rootIds: ['imported'],
        nodes: {
          imported: {
            id: 'imported',
            title: '导入项目',
            childIds: [],
            createdAt: 100,
          },
        },
      }),
    ),
  })
  await expect(page.getByText('导入将替换当前全部内容，确定吗？')).toBeVisible()
  await page.getByRole('button', { name: '确认导入' }).click()

  await expect(page.getByRole('button', { exact: true, name: '导入项目' })).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: '工作' })).toBeHidden()
})

test('resets local data from settings', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: '添加领域' }).click()
  await page.getByLabel('新卡片标题').fill('长期项目')
  await page.getByLabel('新卡片标题').press('Enter')
  await expect(page.getByRole('button', { exact: true, name: '长期项目' })).toBeVisible()

  await page.getByRole('button', { name: '设置' }).click()
  await page.getByRole('button', { name: '恢复初始数据' }).click()
  await page.getByRole('button', { name: '确认恢复' }).click()

  await expect(page.getByRole('button', { exact: true, name: '工作' })).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: '长期项目' })).toBeHidden()

  await page.reload()

  await expect(page.getByRole('button', { exact: true, name: '工作' })).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: '长期项目' })).toBeHidden()
})

async function dragBetween(page: Page, source: Locator, target: Locator) {
  const sourceBox = await source.boundingBox()
  const targetBox = await target.boundingBox()
  expect(sourceBox).not.toBeNull()
  expect(targetBox).not.toBeNull()

  await page.mouse.move(sourceBox!.x + sourceBox!.width / 2, sourceBox!.y + sourceBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(targetBox!.x + targetBox!.width / 2, targetBox!.y + targetBox!.height / 2, {
    steps: 12,
  })
  await page.mouse.up()
}

async function cardOrder(page: Page, first: string, second: string) {
  const firstBox = await page.getByRole('button', { exact: true, name: first }).boundingBox()
  const secondBox = await page.getByRole('button', { exact: true, name: second }).boundingBox()
  if (!firstBox || !secondBox) {
    return 'missing'
  }

  if (firstBox.y < secondBox.y || (firstBox.y === secondBox.y && firstBox.x < secondBox.x)) {
    return `${first}-first`
  }
  return `${second}-first`
}
