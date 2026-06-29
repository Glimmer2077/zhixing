import { now } from './clock'

describe('now', () => {
  it('returns an epoch millisecond timestamp', () => {
    expect(now()).toBeGreaterThan(0)
  })
})
