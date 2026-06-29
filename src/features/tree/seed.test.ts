import { createSeedTree } from './seed'

describe('createSeedTree', () => {
  it('creates the starter tree with injected ids and timestamp', () => {
    const ids = [
      'work',
      'deep',
      'sync',
      'daily',
      'body',
      'home',
      'chat',
      'family',
      'friends',
      'growth',
      'reading',
      'learning',
    ]
    const seed = createSeedTree({
      createId: () => ids.shift() ?? 'extra',
      now: () => 1_782_646_400_000,
    })

    expect(seed.rootIds).toEqual(['work', 'daily', 'chat', 'growth'])
    expect(seed.nodes.work).toMatchObject({
      title: '工作',
      subtitle: '专注与产出',
      childIds: ['deep', 'sync'],
      createdAt: 1_782_646_400_000,
    })
    expect(seed.nodes.growth.childIds).toEqual(['reading', 'learning'])
    expect(Object.values(seed.nodes).every((node) => node.colorKey === undefined)).toBe(true)
    expect(Object.values(seed.nodes).every((node) => node.markKind === undefined)).toBe(true)
  })

  it('can create a starter tree with default id and clock dependencies', () => {
    const seed = createSeedTree()

    expect(seed.rootIds).toHaveLength(4)
    expect(Object.values(seed.nodes)).toHaveLength(12)
    expect(Object.values(seed.nodes).every((node) => typeof node.createdAt === 'number')).toBe(true)
  })
})
