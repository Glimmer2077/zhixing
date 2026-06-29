import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SettingsSheet } from './SettingsSheet'

describe('SettingsSheet', () => {
  it('calls export and import handlers', async () => {
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
    expect(onImportFile).toHaveBeenCalledWith(expect.objectContaining({ name: 'zhixing.json' }))
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
