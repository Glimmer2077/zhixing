import { addNode } from './treeOps'
import { commitTree, createTreeHistoryStore, replaceTreeWithoutHistory } from './treeHistory'
import type { TreeState } from './types'

const initialTree: TreeState = {
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

const importedTree: TreeState = {
  rootIds: ['project'],
  nodes: {
    project: {
      id: 'project',
      title: '项目',
      childIds: [],
      createdAt: 200,
    },
  },
}

describe('treeHistory', () => {
  it('undoes and redoes tracked tree changes through zundo temporal history', () => {
    const store = createTreeHistoryStore(initialTree)

    commitTree(
      store,
      (tree) => addNode(tree, null, { id: 'project', title: '项目', createdAt: 200 }).state,
    )

    expect(store.getState().tree.rootIds).toEqual(['work', 'project'])
    expect(store.temporal.getState().pastStates).toHaveLength(1)

    store.temporal.getState().undo()
    expect(store.getState().tree.rootIds).toEqual(['work'])
    expect(store.temporal.getState().futureStates).toHaveLength(1)

    store.temporal.getState().redo()
    expect(store.getState().tree.rootIds).toEqual(['work', 'project'])
  })

  it('replaces hydrated state without creating undo history', () => {
    const store = createTreeHistoryStore(initialTree)

    replaceTreeWithoutHistory(store, importedTree)

    expect(store.getState().tree).toBe(importedTree)
    expect(store.temporal.getState().pastStates).toHaveLength(0)
    expect(store.temporal.getState().futureStates).toHaveLength(0)
  })
})
