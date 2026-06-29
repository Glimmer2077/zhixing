import { TIER_H, distribute, totalColumnHeight } from './masonry'
import type { Node } from '../tree/types'

const node = (id: string): Node => ({
  id,
  title: id,
  childIds: [],
  createdAt: 100,
})

describe('masonry helpers', () => {
  it('distributes nodes into two columns without losing order inside each column', () => {
    const nodes = ['a', 'b', 'c', 'd', 'e', 'f'].map(node)
    const [left, right] = distribute(nodes)

    expect([...left, ...right].map((item) => item.id).sort()).toEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
    ])
    expect(left.length + right.length).toBe(nodes.length)
  })

  it('chooses the shorter column for the next card based on derived tier heights', () => {
    const nodes = ['work', 'daily', 'chat', 'growth'].map(node)
    const [left, right] = distribute(nodes)
    const leftHeight = totalColumnHeight(left)
    const rightHeight = totalColumnHeight(right)

    expect(Math.abs(leftHeight - rightHeight)).toBeLessThanOrEqual(TIER_H.L + TIER_H.M + TIER_H.S)
  })

  it('does not mutate the input array', () => {
    const nodes = ['a', 'b', 'c'].map(node)
    const original = [...nodes]

    distribute(nodes)

    expect(nodes).toEqual(original)
  })

  it('returns zero height for an empty column', () => {
    expect(totalColumnHeight([])).toBe(0)
  })
})
