import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AppShell } from './AppShell'
import { THEME_STORAGE_KEY } from '../features/appearance/theme'
import { PATH_STORAGE_KEY } from '../features/navigation/useNavigation'
import { createMemoryTreeStorage } from '../features/persistence/treeStorage'
import { exportTreeToJson } from '../features/persistence/treeTransfer'
import type { TreeState } from '../features/tree/types'

const persistedTree: TreeState = {
  rootIds: ['project'],
  nodes: {
    project: {
      id: 'project',
      title: '项目',
      childIds: [],
      createdAt: 100,
    },
  },
}

const nestedPersistedTree: TreeState = {
  rootIds: ['project'],
  nodes: {
    project: {
      id: 'project',
      title: '项目',
      childIds: ['milestone'],
      createdAt: 100,
    },
    milestone: {
      id: 'milestone',
      title: '里程碑',
      childIds: [],
      createdAt: 101,
    },
  },
}

describe('AppShell', () => {
  it('renders the wordmark', () => {
    render(<AppShell />)

    expect(screen.getByRole('heading', { name: '知行' })).toBeInTheDocument()
  })

  it('loads a persisted tree from storage', async () => {
    render(<AppShell storage={createMemoryTreeStorage(persistedTree)} />)

    expect(await screen.findByRole('button', { name: '项目' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '工作' })).not.toBeInTheDocument()
  })

  it('saves tree changes after storage hydration', async () => {
    const user = userEvent.setup()
    const storage = createMemoryTreeStorage()
    const save = vi.spyOn(storage, 'save')

    render(<AppShell storage={storage} />)

    await user.click(screen.getByRole('button', { name: '添加领域' }))
    await user.type(screen.getByLabelText('新卡片标题'), '项目')
    await user.keyboard('{Enter}')

    await vi.waitFor(() => {
      expect(
        save.mock.calls.some(([savedTree]) =>
          Object.values(savedTree.nodes).some((node) => node.title === '项目'),
        ),
      ).toBe(true)
    })
  })

  it('restores the persisted navigation path after reload', async () => {
    window.localStorage.setItem(PATH_STORAGE_KEY, JSON.stringify(['project']))

    render(<AppShell storage={createMemoryTreeStorage(nestedPersistedTree)} />)

    expect(await screen.findByRole('heading', { name: '项目' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '里程碑' })).toBeInTheDocument()
  })

  it('resets stale persisted navigation paths to the root level', async () => {
    window.localStorage.setItem(PATH_STORAGE_KEY, JSON.stringify(['missing']))

    render(<AppShell storage={createMemoryTreeStorage(nestedPersistedTree)} />)

    expect(await screen.findByRole('button', { name: '项目' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '项目' })).not.toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem(PATH_STORAGE_KEY) ?? '')).toEqual([])
  })

  it('imports a tree from settings', async () => {
    const user = userEvent.setup()
    render(<AppShell storage={createMemoryTreeStorage()} />)

    await user.click(screen.getByRole('button', { name: '设置' }))
    await user.upload(
      screen.getByLabelText('导入'),
      new File([exportTreeToJson(persistedTree)], 'zhixing.json', { type: 'application/json' }),
    )
    expect(screen.getByText('导入将替换当前全部内容，确定吗？')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '确认导入' }))

    expect(await screen.findByRole('button', { name: '项目' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '工作' })).not.toBeInTheDocument()
  })

  it('exports the current tree from settings', async () => {
    const user = userEvent.setup()
    const createObjectUrl = vi.fn(() => 'blob:zhixing')
    const revokeObjectUrl = vi.fn()
    const downloads: string[] = []
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloads.push(this.download)
    })
    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, 'createObjectURL')
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL')
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectUrl,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectUrl,
    })

    try {
      render(<AppShell storage={createMemoryTreeStorage()} />)

      await user.click(screen.getByRole('button', { name: '设置' }))
      await user.click(screen.getByRole('button', { name: '导出' }))

      expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob))
      expect(click).toHaveBeenCalledTimes(1)
      expect(downloads[0]).toMatch(/^知行-\d{8}\.json$/)
      expect(revokeObjectUrl).toHaveBeenCalledWith('blob:zhixing')
    } finally {
      if (originalCreateObjectUrl) {
        Object.defineProperty(URL, 'createObjectURL', originalCreateObjectUrl)
      } else {
        Reflect.deleteProperty(URL, 'createObjectURL')
      }

      if (originalRevokeObjectUrl) {
        Object.defineProperty(URL, 'revokeObjectURL', originalRevokeObjectUrl)
      } else {
        Reflect.deleteProperty(URL, 'revokeObjectURL')
      }
      click.mockRestore()
    }
  })

  it('keeps the current tree when import fails', async () => {
    const user = userEvent.setup()
    render(<AppShell storage={createMemoryTreeStorage()} />)

    await user.click(screen.getByRole('button', { name: '设置' }))
    await user.upload(
      screen.getByLabelText('导入'),
      new File(['not json'], 'bad.json', { type: 'application/json' }),
    )
    await user.click(screen.getByRole('button', { name: '确认导入' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '文件无法读取，请检查是否为知行导出的 JSON',
    )
    expect(screen.getByRole('button', { name: '工作' })).toBeInTheDocument()
  })

  it('resets to the seed tree from settings', async () => {
    const user = userEvent.setup()
    const storage = createMemoryTreeStorage(persistedTree)
    const save = vi.spyOn(storage, 'save')

    render(<AppShell storage={storage} />)

    expect(await screen.findByRole('button', { name: '项目' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '设置' }))
    await user.click(screen.getByRole('button', { name: '恢复初始数据' }))
    await user.click(screen.getByRole('button', { name: '确认恢复' }))

    expect(await screen.findByRole('button', { name: '工作' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '项目' })).not.toBeInTheDocument()
    await vi.waitFor(() => {
      expect(
        save.mock.calls.some(([savedTree]) =>
          Object.values(savedTree.nodes).some((node) => node.title === '工作'),
        ),
      ).toBe(true)
    })
  })

  it('persists and applies the selected appearance preference', async () => {
    const user = userEvent.setup()

    render(<AppShell storage={createMemoryTreeStorage()} />)

    await user.click(screen.getByRole('button', { name: '设置' }))
    await user.click(screen.getByRole('radio', { name: '深色' }))

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })
})
