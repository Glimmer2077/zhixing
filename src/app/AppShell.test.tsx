import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AppShell } from './AppShell'
import { createMemoryTreeStorage } from '../features/persistence/treeStorage'
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
})
