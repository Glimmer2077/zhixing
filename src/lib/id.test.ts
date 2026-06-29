import { createId } from './id'

describe('createId', () => {
  it('creates non-empty ids', () => {
    expect(createId()).not.toHaveLength(0)
  })
})
