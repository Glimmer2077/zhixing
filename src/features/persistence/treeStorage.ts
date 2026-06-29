import { get, set } from 'idb-keyval'

import { validateTreeInvariant, type TreeExport } from '../tree/schema'
import type { TreeState } from '../tree/types'

const TREE_STORAGE_KEY = 'zhixing.tree.v1'

export interface TreeStorage {
  load: () => Promise<TreeState | null>
  save: (tree: TreeState) => Promise<void>
}

export const toStoredTree = (tree: TreeState): TreeExport => ({
  version: 1,
  nodes: tree.nodes,
  rootIds: tree.rootIds,
})

export const parseStoredTree = (input: unknown): TreeState | null => {
  if (input === undefined || input === null) {
    return null
  }

  try {
    return validateTreeInvariant(input)
  } catch {
    return null
  }
}

export const createMemoryTreeStorage = (initialTree: TreeState | null = null): TreeStorage => {
  let storedTree: TreeExport | null = initialTree ? toStoredTree(initialTree) : null

  return {
    load: () => Promise.resolve(parseStoredTree(storedTree)),
    save: (tree) => {
      storedTree = toStoredTree(tree)
      return Promise.resolve()
    },
  }
}

export const indexedDbTreeStorage: TreeStorage = {
  load: async () => {
    if (!canUseIndexedDb()) {
      return null
    }

    try {
      return parseStoredTree(await get<unknown>(TREE_STORAGE_KEY))
    } catch {
      return null
    }
  },
  save: async (tree) => {
    if (!canUseIndexedDb()) {
      return
    }

    try {
      await set(TREE_STORAGE_KEY, toStoredTree(tree))
    } catch {
      // Storage quota or private-mode failures should not block local editing.
    }
  },
}

const canUseIndexedDb = (): boolean => typeof globalThis.indexedDB !== 'undefined'
