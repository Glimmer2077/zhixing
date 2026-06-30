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

  it('does not render history actions in the compact header', () => {
    render(
      <Header
        title={null}
        canGoBack={false}
        onBack={() => undefined}
        onSettings={() => undefined}
      />,
    )

    expect(screen.queryByRole('button', { name: '撤销上一步' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '重做上一步' })).not.toBeInTheDocument()
  })
})
