import type { ColorKey, Node } from './types'
import { MARK_KINDS, PALETTE, colorFor, hash, markFor, paletteByKey, sizeFor } from './visuals'

describe('visual derivation helpers', () => {
  const node: Node = {
    id: 'node-alpha',
    title: '工作',
    childIds: [],
    createdAt: 1_782_646_400_000,
  }

  it('hashes strings deterministically', () => {
    expect(hash('node-alpha')).toBe(hash('node-alpha'))
    expect(hash('node-alpha')).not.toBe(hash('node-beta'))
  })

  it('derives stable color, mark, and size from ids', () => {
    expect(PALETTE.map((entry) => entry.key)).toContain(colorFor(node))
    expect(MARK_KINDS).toContain(markFor(node))
    expect(['S', 'M', 'L']).toContain(sizeFor(node.id))
    expect(colorFor(node)).toBe(colorFor({ ...node }))
    expect(markFor(node)).toBe(markFor({ ...node }))
    expect(sizeFor(node.id)).toBe(sizeFor(node.id))
  })

  it('respects user overrides for color and mark', () => {
    expect(colorFor({ ...node, colorKey: 'sage' })).toBe('sage')
    expect(markFor({ ...node, markKind: 'ring' })).toBe('ring')
  })

  it('looks up full palette entries by key', () => {
    expect(paletteByKey('sand')).toEqual(PALETTE[0])
  })

  it('throws for unknown palette keys', () => {
    expect(() => paletteByKey('missing' as ColorKey)).toThrow('Unknown palette key: missing')
  })
})
