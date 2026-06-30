import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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

    await user.click(screen.getByRole('button', { name: '导出' }))
    await user.upload(
      screen.getByLabelText('导入'),
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
      screen.getByLabelText('导入'),
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

  it('shows appearance controls and reports preference changes', async () => {
    const user = userEvent.setup()
    const onThemePreferenceChange = vi.fn()

    render(
      <SettingsSheet
        importError={null}
        onClose={() => undefined}
        onExport={() => undefined}
        onImportFile={() => undefined}
        onReset={() => undefined}
        onThemePreferenceChange={onThemePreferenceChange}
        themePreference="system"
      />,
    )

    expect(screen.getByRole('group', { name: '外观' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '跟随系统' })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: '深色' }))

    expect(onThemePreferenceChange).toHaveBeenCalledWith('dark')
  })

  it('shows import errors', () => {
    render(
      <SettingsSheet
        importError="文件无法读取，请检查是否为知行导出的 JSON"
        onClose={() => undefined}
        onExport={() => undefined}
        onImportFile={() => undefined}
        onReset={() => undefined}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('文件无法读取，请检查是否为知行导出的 JSON')
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

  it('restores focus to the opener when closed', async () => {
    const user = userEvent.setup()

    render(<SettingsSheetHarness />)

    const opener = screen.getByRole('button', { name: '打开设置' })
    await user.click(opener)
    await user.click(screen.getByRole('button', { name: '关闭' }))

    expect(screen.queryByRole('dialog', { name: '设置' })).not.toBeInTheDocument()
    await waitFor(() => expect(opener).toHaveFocus())
  })
})

function SettingsSheetHarness() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)} type="button">
        打开设置
      </button>
      {isOpen ? (
        <SettingsSheet
          importError={null}
          onClose={() => setIsOpen(false)}
          onExport={() => undefined}
          onImportFile={() => undefined}
          onReset={() => undefined}
        />
      ) : null}
    </>
  )
}
