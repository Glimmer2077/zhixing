import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SettingsSheet } from './SettingsSheet'

describe('SettingsSheet', () => {
  it('calls export and confirms imports before calling the import handler', async () => {
    const user = userEvent.setup()
    const onExport = vi.fn()
    const onImportFile = vi.fn()

    render(
      <SettingsSheet
        importError={null}
        onClose={() => undefined}
        onExport={onExport}
        onImportFile={onImportFile}
        onReset={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: '导出 JSON' }))
    await user.upload(
      screen.getByLabelText('导入 JSON'),
      new File(['{}'], 'zhixing.json', { type: 'application/json' }),
    )

    expect(onExport).toHaveBeenCalledTimes(1)
    expect(screen.getByText('导入将替换当前全部内容，确定吗？')).toBeInTheDocument()
    expect(onImportFile).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: '确认导入' }))

    expect(onImportFile).toHaveBeenCalledWith(expect.objectContaining({ name: 'zhixing.json' }))
  })

  it('can cancel a pending import', async () => {
    const user = userEvent.setup()
    const onImportFile = vi.fn()

    render(
      <SettingsSheet
        importError={null}
        onClose={() => undefined}
        onExport={() => undefined}
        onImportFile={onImportFile}
        onReset={() => undefined}
      />,
    )

    await user.upload(
      screen.getByLabelText('导入 JSON'),
      new File(['{}'], 'zhixing.json', { type: 'application/json' }),
    )
    await user.click(screen.getByRole('button', { name: '取消' }))

    expect(onImportFile).not.toHaveBeenCalled()
    expect(screen.queryByText('导入将替换当前全部内容，确定吗？')).not.toBeInTheDocument()
  })

  it('shows backup reminder and about information', () => {
    render(
      <SettingsSheet
        importError={null}
        onClose={() => undefined}
        onExport={() => undefined}
        onImportFile={() => undefined}
        onReset={() => undefined}
      />,
    )

    expect(screen.getByText('iOS 可能清理本地数据，建议偶尔导出备份。')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '关于' })).toBeInTheDocument()
    expect(screen.getByText('本地优先，无账号，无后端。')).toBeInTheDocument()
  })

  it('shows import errors', () => {
    render(
      <SettingsSheet
        importError="导入失败"
        onClose={() => undefined}
        onExport={() => undefined}
        onImportFile={() => undefined}
        onReset={() => undefined}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('导入失败')
  })

  it('requires confirmation before resetting data', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()

    render(
      <SettingsSheet
        importError={null}
        onClose={() => undefined}
        onExport={() => undefined}
        onImportFile={() => undefined}
        onReset={onReset}
      />,
    )

    await user.click(screen.getByRole('button', { name: '恢复初始数据' }))

    expect(onReset).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: '确认恢复' }))

    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
