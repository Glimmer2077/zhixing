import type { TreeState } from '../tree/types'
import { createMemoryTreeStorage, parseStoredTree, toStoredTree } from './treeStorage'

const tree: TreeState = {
  rootIds: ['work'],
  nodes: {
    work: {
      id: 'work',
      title: '工作',
      childIds: [],
      createdAt: 100,
    },
  },
}

describe('treeStorage', () => {
  it('wraps tree state in a versioned storage payload', () => {
    expect(toStoredTree(tree)).toEqual({
      version: 1,
      rootIds: ['work'],
      nodes: tree.nodes,
    })
  })

  it('parses valid stored trees and rejects invalid payloads', () => {
    expect(parseStoredTree(toStoredTree(tree))).toEqual(tree)
    expect(parseStoredTree({ version: 2, nodes: {}, rootIds: [] })).toBeNull()
    expect(parseStoredTree({ version: 1, nodes: {}, rootIds: ['missing'] })).toBeNull()
  })

  it('stores and loads tree state through the memory adapter', async () => {
    const storage = createMemoryTreeStorage()

    expect(await storage.load()).toBeNull()
    await storage.save(tree)

    expect(await storage.load()).toEqual(tree)
  })
})
