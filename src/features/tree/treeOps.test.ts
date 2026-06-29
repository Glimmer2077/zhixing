import type { TreeState } from './types'
import {
  TreeCycleError,
  addNode,
  childrenOf,
  isDescendant,
  moveNode,
  pathTo,
  removeNode,
  reorder,
  updateNode,
} from './treeOps'

const baseState = (): TreeState => ({
  rootIds: ['work', 'life'],
  nodes: {
    work: {
      id: 'work',
      title: '工作',
      subtitle: '专注与产出',
      childIds: ['deep', 'sync'],
      createdAt: 100,
    },
    deep: {
      id: 'deep',
      title: '深度工作',
      childIds: ['writing'],
      createdAt: 110,
    },
    writing: {
      id: 'writing',
      title: '写作',
      childIds: [],
      createdAt: 111,
    },
    sync: {
      id: 'sync',
      title: '沟通协作',
      childIds: [],
      createdAt: 120,
    },
    life: {
      id: 'life',
      title: '日常',
      childIds: ['body'],
      createdAt: 200,
    },
    body: {
      id: 'body',
      title: '身体',
      childIds: [],
      createdAt: 210,
    },
  },
})

describe('treeOps', () => {
  it('adds root and child nodes without mutating the previous state', () => {
    const original = baseState()

    const rootResult = addNode(original, null, {
      id: 'growth',
      title: '成长',
      createdAt: 300,
    })
    const childResult = addNode(rootResult.state, 'growth', {
      id: 'reading',
      title: '阅读',
      subtitle: '输入',
      createdAt: 310,
    })

    expect(original.rootIds).toEqual(['work', 'life'])
    expect(rootResult.state.rootIds).toEqual(['work', 'life', 'growth'])
    expect(childResult.state.nodes.growth.childIds).toEqual(['reading'])
    expect(childResult.state.nodes.reading).toMatchObject({
      id: 'reading',
      title: '阅读',
      subtitle: '输入',
      childIds: [],
      createdAt: 310,
    })
  })

  it('returns the same state when adding to a missing parent', () => {
    const original = baseState()
    const result = addNode(original, 'missing', { id: 'lost', title: 'Lost' })

    expect(result).toEqual({ state: original, id: 'lost' })
  })

  it('generates an id and timestamp when add init omits them', () => {
    const result = addNode(
      { nodes: {}, rootIds: [] },
      null,
      { title: '聊天' },
      {
        createId: () => 'chat',
        now: () => 400,
      },
    )

    expect(result.id).toBe('chat')
    expect(result.state.nodes.chat).toMatchObject({
      id: 'chat',
      title: '聊天',
      childIds: [],
      createdAt: 400,
    })
  })

  it('copies optional fields and child ids from add init', () => {
    const result = addNode({ nodes: {}, rootIds: [] }, null, {
      id: 'custom',
      title: '自定义',
      subtitle: '副标题',
      colorKey: 'clay',
      markKind: 'pill',
      childIds: ['detached'],
      createdAt: 500,
    })

    expect(result.state.nodes.custom).toMatchObject({
      subtitle: '副标题',
      colorKey: 'clay',
      markKind: 'pill',
      childIds: ['detached'],
    })
  })

  it('updates editable node fields only', () => {
    const original = baseState()
    const updated = updateNode(original, 'work', {
      title: '工作流',
      subtitle: undefined,
      colorKey: 'sage',
      markKind: 'ring',
    })

    expect(original.nodes.work.title).toBe('工作')
    expect(updated.nodes.work).toMatchObject({
      id: 'work',
      title: '工作流',
      colorKey: 'sage',
      markKind: 'ring',
      childIds: ['deep', 'sync'],
    })
    expect(updated.nodes.work).not.toHaveProperty('subtitle')
  })

  it('returns the same state when updating a missing node', () => {
    const original = baseState()

    expect(updateNode(original, 'missing', { title: 'Missing' })).toBe(original)
  })

  it('removes a node, its descendants, and its parent reference', () => {
    const original = baseState()
    const updated = removeNode(original, 'deep')

    expect(Object.keys(updated.nodes).sort()).toEqual(['body', 'life', 'sync', 'work'])
    expect(updated.nodes.work.childIds).toEqual(['sync'])
    expect(original.nodes.work.childIds).toEqual(['deep', 'sync'])
  })

  it('removes root subtrees from root ids', () => {
    const updated = removeNode(baseState(), 'work')

    expect(updated.rootIds).toEqual(['life'])
    expect(Object.keys(updated.nodes).sort()).toEqual(['body', 'life'])
  })

  it('returns the same state when removing a missing node', () => {
    const original = baseState()

    expect(removeNode(original, 'missing')).toBe(original)
  })

  it('moves nodes between parents and clamps insertion indexes', () => {
    const original = baseState()
    const updated = moveNode(original, 'sync', 'life', 20)

    expect(updated.nodes.work.childIds).toEqual(['deep'])
    expect(updated.nodes.life.childIds).toEqual(['body', 'sync'])
    expect(childrenOf(updated, 'life').map((node) => node.id)).toEqual(['body', 'sync'])
  })

  it('moves a child to root and root node into another parent', () => {
    const movedToRoot = moveNode(baseState(), 'body', null, 1)
    const movedRootToParent = moveNode(movedToRoot, 'life', 'work', 0)

    expect(movedToRoot.rootIds).toEqual(['work', 'body', 'life'])
    expect(movedToRoot.nodes.life.childIds).toEqual([])
    expect(movedRootToParent.rootIds).toEqual(['work', 'body'])
    expect(movedRootToParent.nodes.work.childIds).toEqual(['life', 'deep', 'sync'])
  })

  it('returns the same state for invalid moves', () => {
    const original = baseState()

    expect(moveNode(original, 'missing', null, 0)).toBe(original)
    expect(moveNode(original, 'body', 'missing', 0)).toBe(original)
  })

  it('returns the same state when moving an orphan node', () => {
    const base = baseState()
    const original: TreeState = {
      ...base,
      nodes: {
        ...base.nodes,
        orphan: {
          id: 'orphan',
          title: '孤儿',
          childIds: [],
          createdAt: 999,
        },
      },
    }

    expect(moveNode(original, 'orphan', null, 0)).toBe(original)
  })

  it('rejects moving a node into itself or its descendants', () => {
    expect(() => moveNode(baseState(), 'work', 'work', 0)).toThrow(TreeCycleError)
    expect(() => moveNode(baseState(), 'work', 'writing', 0)).toThrow(TreeCycleError)
  })

  it('reorders siblings without mutating source state', () => {
    const original = baseState()
    const updated = reorder(original, 'work', 0, 1)

    expect(updated.nodes.work.childIds).toEqual(['sync', 'deep'])
    expect(original.nodes.work.childIds).toEqual(['deep', 'sync'])
  })

  it('reorders root ids and clamps negative target indexes', () => {
    const updated = reorder(baseState(), null, 1, -10)

    expect(updated.rootIds).toEqual(['life', 'work'])
  })

  it('returns the same state for invalid reorder requests', () => {
    const original = baseState()

    expect(reorder(original, 'missing', 0, 1)).toBe(original)
    expect(reorder(original, 'work', -1, 1)).toBe(original)
    expect(reorder(original, 'work', 10, 1)).toBe(original)
  })

  it('selects children, paths, and descendant relationships', () => {
    const state = baseState()

    expect(childrenOf(state, null).map((node) => node.id)).toEqual(['work', 'life'])
    expect(pathTo(state, 'writing').map((node) => node.id)).toEqual(['work', 'deep', 'writing'])
    expect(pathTo(state, 'missing')).toEqual([])
    expect(isDescendant(state, 'work', 'writing')).toBe(true)
    expect(isDescendant(state, 'deep', 'life')).toBe(false)
    expect(isDescendant(state, 'missing', 'life')).toBe(false)
    expect(childrenOf(state, 'missing')).toEqual([])
  })
})
