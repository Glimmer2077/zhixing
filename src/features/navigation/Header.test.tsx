import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Header } from './Header'

describe('Header', () => {
  it('renders the wordmark at root', () => {
    render(
      <Header
        title={null}
        canGoBack={false}
        onBack={() => undefined}
        onSettings={() => undefined}
      />,
    )

    expect(screen.getByRole('heading', { name: '知行' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '返回' })).not.toBeInTheDocument()
  })

  it('renders a back button and current title when nested', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()

    render(<Header title="工作" canGoBack onBack={onBack} onSettings={() => undefined} />)
    await user.click(screen.getByRole('button', { name: '返回' }))

    expect(screen.getByRole('heading', { name: '工作' })).toBeInTheDocument()
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('opens settings', async () => {
    const user = userEvent.setup()
    const onSettings = vi.fn()

    render(
      <Header title={null} canGoBack={false} onBack={() => undefined} onSettings={onSettings} />,
    )
    await user.click(screen.getByRole('button', { name: '设置' }))

    expect(onSettings).toHaveBeenCalledTimes(1)
  })

  it('shows undo and redo affordances when history is available', async () => {
    const user = userEvent.setup()
    const onUndo = vi.fn()
    const onRedo = vi.fn()

    render(
      <Header
        title={null}
        canGoBack={false}
        canRedo
        canUndo
        onBack={() => undefined}
        onRedo={onRedo}
        onSettings={() => undefined}
        onUndo={onUndo}
      />,
    )

    await user.click(screen.getByRole('button', { name: '撤销上一步' }))
    await user.click(screen.getByRole('button', { name: '重做上一步' }))

    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(onRedo).toHaveBeenCalledTimes(1)
  })
})
