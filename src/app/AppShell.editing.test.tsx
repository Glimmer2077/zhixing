import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AppShell } from './AppShell'

describe('AppShell editing', () => {
  it('adds a card at the current level', async () => {
    const user = userEvent.setup()
    render(<AppShell />)

    await user.click(screen.getByRole('button', { name: '添加领域' }))
    await user.type(screen.getByLabelText('新卡片标题'), '项目')
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('button', { name: '项目' })).toBeInTheDocument()
  })

  it('edits a card title and subtitle', async () => {
    const user = userEvent.setup()
    render(<AppShell />)

    openEditSheet('工作')
    await user.clear(screen.getByLabelText('标题'))
    await user.type(screen.getByLabelText('标题'), '工作流')
    await user.clear(screen.getByLabelText('副标题（可选）'))
    await user.type(screen.getByLabelText('副标题（可选）'), '节奏和产出')
    await user.click(screen.getByRole('button', { name: '完成' }))

    expect(await screen.findByRole('button', { name: '工作流' })).toBeInTheDocument()
    expect(screen.getByText('节奏和产出')).toBeInTheDocument()
  })

  it('does not show transient undo toast after adding a card', async () => {
    const user = userEvent.setup()
    render(<AppShell />)

    await user.click(screen.getByRole('button', { name: '添加领域' }))
    await user.type(screen.getByLabelText('新卡片标题'), '项目')
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('button', { name: '项目' })).toBeInTheDocument()
    expect(screen.queryByText('已更改 · 撤销')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '撤销' })).not.toBeInTheDocument()
  })

  it('deletes a card without showing an undo toast', async () => {
    const user = userEvent.setup()
    render(<AppShell />)

    openEditSheet('工作')
    await user.click(screen.getByRole('button', { name: '删除' }))
    await user.click(screen.getByRole('button', { name: '确认删除' }))

    expect(screen.queryByRole('button', { name: '工作' })).not.toBeInTheDocument()
    expect(screen.queryByText('已删除 · 撤销')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '撤销' })).not.toBeInTheDocument()
  })

  it('does not expose header undo or redo controls after edits', async () => {
    const user = userEvent.setup()
    render(<AppShell />)

    await user.click(screen.getByRole('button', { name: '添加领域' }))
    await user.type(screen.getByLabelText('新卡片标题'), '项目')
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('button', { name: '项目' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '撤销上一步' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '重做上一步' })).not.toBeInTheDocument()
  })

  it('moves a child card to the root level', async () => {
    const user = userEvent.setup()
    render(<AppShell />)

    await user.click(screen.getByRole('button', { name: '工作' }))
    expect(await screen.findByRole('button', { name: '深度工作' })).toBeInTheDocument()
    openEditSheet('深度工作')
    await user.selectOptions(screen.getByLabelText('移动到'), '__root__')
    await user.click(screen.getByRole('button', { name: '完成' }))

    expect(screen.queryByRole('button', { name: '深度工作' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '返回' }))
    expect(await screen.findByRole('button', { name: '深度工作' })).toBeInTheDocument()
  })

  it('does not offer descendants as move targets', () => {
    render(<AppShell />)

    openEditSheet('工作')

    const moveTo = screen.getByLabelText('移动到')
    expect(within(moveTo).getByRole('option', { name: '根级' })).toBeInTheDocument()
    expect(within(moveTo).getByRole('option', { name: '日常' })).toBeInTheDocument()
    expect(
      within(moveTo).queryByRole('option', { name: '工作 / 深度工作' }),
    ).not.toBeInTheDocument()
  })
})

function openEditSheet(cardName: string) {
  fireEvent.contextMenu(screen.getByRole('button', { name: cardName }))
  expect(screen.getByRole('dialog', { name: '编辑卡片' })).toBeInTheDocument()
}
