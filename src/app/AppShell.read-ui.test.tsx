import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AppShell } from './AppShell'

describe('AppShell read UI', () => {
  it('renders the first-run seed at the root level', () => {
    render(<AppShell />)

    const grid = screen.getByRole('list', { name: '卡片' })
    expect(within(grid).getByRole('button', { name: '工作' })).toBeInTheDocument()
    expect(within(grid).getByRole('button', { name: '日常' })).toBeInTheDocument()
    expect(within(grid).getByRole('button', { name: '聊天' })).toBeInTheDocument()
    expect(within(grid).getByRole('button', { name: '成长' })).toBeInTheDocument()
  })

  it('drills into a card, shows children, then goes back', async () => {
    const user = userEvent.setup()
    render(<AppShell />)

    await user.click(screen.getByRole('button', { name: '工作' }))

    expect(screen.getByRole('heading', { name: '工作' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: '深度工作' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '沟通协作' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '返回' }))

    expect(screen.getByRole('heading', { name: '知行' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: '日常' })).toBeInTheDocument()
  })

  it('returns from a nested card with a downward swipe gesture', async () => {
    const user = userEvent.setup()
    render(<AppShell />)

    await user.click(screen.getByRole('button', { name: '工作' }))

    const heading = screen.getByRole('heading', { name: '工作' })
    fireEvent.pointerDown(heading, { clientX: 100, clientY: 80, pointerId: 1 })
    fireEvent.pointerUp(heading, { clientX: 112, clientY: 184, pointerId: 1 })

    expect(await screen.findByRole('heading', { name: '知行' })).toBeInTheDocument()
  })

  it('shows the empty state for leaf cards', async () => {
    const user = userEvent.setup()
    render(<AppShell />)

    await user.click(screen.getByRole('button', { name: '工作' }))
    await user.click(await screen.findByRole('button', { name: '深度工作' }))

    expect(await screen.findByText('还没有卡片')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '添加' })).toBeEnabled()
  })
})
