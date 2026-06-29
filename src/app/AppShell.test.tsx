import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AppShell } from './AppShell'
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

  it('imports a tree from settings', async () => {
    const user = userEvent.setup()
    render(<AppShell storage={createMemoryTreeStorage()} />)

    await user.click(screen.getByRole('button', { name: '设置' }))
    await user.upload(
      screen.getByLabelText('导入 JSON'),
      new File([exportTreeToJson(persistedTree)], 'zhixing.json', { type: 'application/json' }),
    )

    expect(await screen.findByRole('button', { name: '项目' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '工作' })).not.toBeInTheDocument()
  })

  it('exports the current tree from settings', async () => {
    const user = userEvent.setup()
    const createObjectUrl = vi.fn(() => 'blob:zhixing')
    const revokeObjectUrl = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
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
      await user.click(screen.getByRole('button', { name: '导出 JSON' }))

      expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob))
      expect(click).toHaveBeenCalledTimes(1)
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
      screen.getByLabelText('导入 JSON'),
      new File(['not json'], 'bad.json', { type: 'application/json' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('导入失败')
    expect(screen.getByRole('button', { name: '工作' })).toBeInTheDocument()
  })
})
