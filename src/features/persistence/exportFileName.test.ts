import { exportFileName } from './exportFileName'

describe('exportFileName', () => {
  it('uses the spec filename format with Chinese app name and compact date', () => {
    expect(exportFileName(new Date('2026-06-30T12:34:56Z'))).toBe('知行-20260630.json')
  })
})
