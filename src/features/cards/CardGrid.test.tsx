import { render, screen, within } from '@testing-library/react'

import { CardGrid } from './CardGrid'
import type { Node } from '../tree/types'

const nodes: Node[] = [
  {
    id: 'work',
    title: '工作',
    subtitle: '专注与产出',
    childIds: [],
    createdAt: Date.UTC(2026, 5, 29, 12),
  },
  {
    id: 'daily',
    title: '日常',
    subtitle: '照顾好自己',
    childIds: [],
    createdAt: Date.UTC(2026, 5, 29, 12),
  },
]

describe('CardGrid', () => {
  it('renders cards in a two-column grid with an add placeholder', () => {
    render(
      <CardGrid
        nodes={nodes}
        addLabel="添加领域"
        onAdd={() => undefined}
        onEdit={() => undefined}
        onOpen={() => undefined}
      />,
    )

    const grid = screen.getByRole('list', { name: '卡片' })
    expect(within(grid).getByRole('button', { name: '工作' })).toBeInTheDocument()
    expect(within(grid).getByRole('button', { name: '日常' })).toBeInTheDocument()
    expect(within(grid).getByRole('button', { name: '添加领域' })).toBeEnabled()
  })

  it('renders the empty state when there are no nodes', () => {
    render(
      <CardGrid
        nodes={[]}
        addLabel="添加"
        onAdd={() => undefined}
        onEdit={() => undefined}
        onOpen={() => undefined}
      />,
    )

    expect(screen.getByText('还没有卡片')).toBeInTheDocument()
    expect(screen.getByText('点下面的「添加」，放进第一张。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '添加' })).toBeEnabled()
  })
})
