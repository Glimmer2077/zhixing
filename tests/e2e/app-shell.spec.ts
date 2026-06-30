import { expect, test, type Locator, type Page } from '@playwright/test'

test('shows the wordmark', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '知行' })).toBeVisible()
})

test('loads the app shell when network requests fail', async ({ browserName, context, page }) => {
  test.skip(
    browserName !== 'chromium',
    'Playwright WebKit blocks intercepted reloads before the service worker fallback can be asserted.',
  )

  await page.goto('/')
  await expect(page.getByRole('heading', { name: '知行' })).toBeVisible()

  await waitForServiceWorkerControl(page)
  await page.reload()
  await expect(page.getByRole('heading', { name: '知行' })).toBeVisible()

  await context.route('**/*', (route) => route.abort())
  try {
    await page.reload()
    await expect(page.getByRole('heading', { name: '知行' })).toBeVisible()
  } finally {
    await context.unroute('**/*')
  }
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

test('returns from a nested card with a downward swipe', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { exact: true, name: '工作' }).click()
  await expect(page.getByRole('heading', { name: '工作' })).toBeVisible()

  const headingBox = await page.getByRole('heading', { name: '工作' }).boundingBox()
  expect(headingBox).not.toBeNull()
  const x = headingBox!.x + headingBox!.width / 2
  const y = headingBox!.y + headingBox!.height / 2

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 8, y + 124, { steps: 8 })
  await page.mouse.up()

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

test('undoes and redoes a structural edit from the header', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: '添加领域' }).click()
  await page.getByLabel('新卡片标题').fill('项目')
  await page.getByLabel('新卡片标题').press('Enter')
  await expect(page.getByRole('button', { exact: true, name: '项目' })).toBeVisible()

  await page.getByRole('button', { name: '撤销上一步' }).click()
  await expect(page.getByRole('button', { exact: true, name: '项目' })).toBeHidden()

  await page.getByRole('button', { name: '重做上一步' }).click()
  await expect(page.getByRole('button', { exact: true, name: '项目' })).toBeVisible()
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

test('reparents a card by dragging it onto another card', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('button', { exact: true, name: '工作' })).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: '日常' })).toBeVisible()

  await dragBetween(
    page,
    page.getByRole('button', { name: '排序 工作' }),
    page.getByRole('button', { exact: true, name: '日常' }),
  )

  await expect(page.getByRole('button', { exact: true, name: '工作' })).toBeHidden()

  await page.getByRole('button', { exact: true, name: '日常' }).click()
  await expect(page.getByRole('heading', { name: '日常' })).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: '工作' })).toBeVisible()
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
  await waitForStoredCard(page, '长期项目')

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
  await page.getByLabel('导入').setInputFiles({
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

test('restores focus after closing settings', async ({ page }) => {
  await page.goto('/')

  const settingsButton = page.getByRole('button', { name: '设置' })
  await settingsButton.click()
  await expect(page.getByRole('dialog', { name: '设置' })).toBeVisible()

  await page.getByRole('button', { name: '关闭' }).click()

  await expect(page.getByRole('dialog', { name: '设置' })).toBeHidden()
  await expect(settingsButton).toBeFocused()
})

test('honors the reduced motion preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  await expect
    .poll(() => page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"))
    .toBe(true)

  await page.getByRole('button', { exact: true, name: '工作' }).click()
  await expect(page.getByRole('heading', { name: '工作' })).toBeVisible()
})

test('persists the selected appearance preference', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: '设置' }).click()
  await page.getByRole('radio', { name: '深色' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await page.reload()

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
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

async function waitForStoredCard(page: Page, title: string) {
  const escapedTitle = JSON.stringify(title)
  await expect
    .poll(() =>
      page.evaluate(`
        new Promise((resolve) => {
          const request = indexedDB.open('keyval-store')
          request.onerror = () => resolve(false)
          request.onsuccess = () => {
            const db = request.result
            const transaction = db.transaction('keyval', 'readonly')
            const getRequest = transaction.objectStore('keyval').get('zhixing.tree.v1')
            getRequest.onerror = () => resolve(false)
            getRequest.onsuccess = () => {
              const tree = getRequest.result
              resolve(Boolean(
                tree &&
                tree.nodes &&
                Object.values(tree.nodes).some((node) => node && node.title === ${escapedTitle})
              ))
            }
          }
        })
      `),
    )
    .toBe(true)
}

async function waitForServiceWorkerControl(page: Page) {
  await page.evaluate(`
    (async () => {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers are unavailable')
      }

      await navigator.serviceWorker.ready
      if (navigator.serviceWorker.controller) {
        return
      }

      await new Promise((resolve, reject) => {
        let timeout
        const handleControllerChange = () => {
          clearTimeout(timeout)
          resolve()
        }

        timeout = setTimeout(() => {
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
          reject(new Error('Service worker did not control the page'))
        }, 5000)

        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange, {
          once: true,
        })
      })
    })()
  `)
}
