import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EditSheet } from './EditSheet'
import type { Node } from '../tree/types'

const node: Node = {
  id: 'work',
  title: '工作',
  subtitle: '专注与产出',
  childIds: [],
  createdAt: Date.UTC(2026, 5, 29, 12),
}

describe('EditSheet', () => {
  it('submits title, subtitle, color, and mark changes', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <EditSheet
        node={node}
        onClose={() => undefined}
        onDelete={() => undefined}
        parentId={null}
        parentOptions={[{ id: null, label: '根级' }]}
        onSave={onSave}
      />,
    )

    await user.clear(screen.getByLabelText('标题'))
    await user.type(screen.getByLabelText('标题'), '工作流')
    await user.clear(screen.getByLabelText('副标题（可选）'))
    await user.type(screen.getByLabelText('副标题（可选）'), '新的节奏')
    await user.click(screen.getByRole('radio', { name: 'sage' }))
    await user.click(screen.getByRole('radio', { name: 'ring' }))
    await user.click(screen.getByRole('button', { name: '完成' }))

    expect(onSave).toHaveBeenCalledWith(
      {
        title: '工作流',
        subtitle: '新的节奏',
        colorKey: 'sage',
        markKind: 'ring',
      },
      null,
    )
  })

  it('submits the selected parent id', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <EditSheet
        node={node}
        onClose={() => undefined}
        onDelete={() => undefined}
        parentId="daily"
        parentOptions={[
          { id: null, label: '根级' },
          { id: 'daily', label: '日常' },
          { id: 'growth', label: '成长' },
        ]}
        onSave={onSave}
      />,
    )

    await user.selectOptions(screen.getByLabelText('移动到'), 'growth')
    await user.click(screen.getByRole('button', { name: '完成' }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '工作',
      }),
      'growth',
    )
  })

  it('asks for confirmation before deleting', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <EditSheet
        node={node}
        onClose={() => undefined}
        onDelete={onDelete}
        parentId={null}
        parentOptions={[{ id: null, label: '根级' }]}
        onSave={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: '删除' }))
    expect(screen.getByText('删除「工作」及其全部内容？此操作可撤销。')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '确认删除' }))
    expect(onDelete).toHaveBeenCalledWith('work')
  })
})
