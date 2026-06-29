import { formatDate } from './date'

describe('formatDate', () => {
  it('formats dates as YYYY.M.D in the selected timezone', () => {
    expect(formatDate(Date.UTC(2026, 5, 29), 'UTC')).toBe('2026.6.29')
  })

  it('does not add leading zeros', () => {
    expect(formatDate(Date.UTC(2026, 0, 5), 'UTC')).toBe('2026.1.5')
  })
})
