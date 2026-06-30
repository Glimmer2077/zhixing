import { render, screen, within } from '@testing-library/react'

import { CardGrid } from './CardGrid'
import { dropIntentForPoint } from './dropIntent'
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
        onReparent={() => undefined}
        onReorder={() => undefined}
      />,
    )

    const grid = screen.getByRole('list', { name: '卡片' })
    expect(within(grid).getByRole('button', { name: '工作' })).toBeInTheDocument()
    expect(within(grid).getByRole('button', { name: '日常' })).toBeInTheDocument()
    expect(within(grid).getByRole('button', { name: '排序 工作' })).toBeInTheDocument()
    expect(within(grid).getByRole('button', { name: '排序 日常' })).toBeInTheDocument()
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
        onReparent={() => undefined}
        onReorder={() => undefined}
      />,
    )

    expect(screen.getByText('还没有卡片')).toBeInTheDocument()
    expect(screen.getByText('点下面的「添加」，放进第一张。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '添加' })).toBeEnabled()
  })

  it('classifies handle drops as reorder and card-body drops as reparent', () => {
    const handleRect = new DOMRect(8, 8, 36, 36)
    const targetRect = new DOMRect(0, 0, 160, 180)

    expect(dropIntentForPoint({ x: 26, y: 26 }, handleRect)).toBe('reorder')
    expect(dropIntentForPoint({ x: 120, y: 40 }, handleRect, targetRect)).toBe('reorder')
    expect(dropIntentForPoint({ x: 92, y: 92 }, handleRect, targetRect)).toBe('reparent')
  })
})
