import { createStore, type StoreApi } from 'zustand/vanilla'
import { temporal, type TemporalState } from 'zundo'

import type { TreeState } from './types'

interface TreeHistoryState {
  tree: TreeState
}

type TrackedTreeState = Pick<TreeHistoryState, 'tree'>

export type TreeHistoryStore = StoreApi<TreeHistoryState> & {
  temporal: StoreApi<TemporalState<TrackedTreeState>>
}

export type TreeUpdater = TreeState | ((tree: TreeState) => TreeState)

export const createTreeHistoryStore = (initialTree: TreeState): TreeHistoryStore =>
  createStore<TreeHistoryState>()(
    temporal(
      () => ({
        tree: initialTree,
      }),
      {
        equality: (past, current) => past.tree === current.tree,
        limit: 100,
        partialize: (state): TrackedTreeState => ({ tree: state.tree }),
      },
    ),
  )

export const commitTree = (store: TreeHistoryStore, updater: TreeUpdater) => {
  store.setState((state) => {
    const nextTree = typeof updater === 'function' ? updater(state.tree) : updater
    if (nextTree === state.tree) {
      return state
    }
    return { tree: nextTree }
  })
}

export const replaceTreeWithoutHistory = (store: TreeHistoryStore, tree: TreeState) => {
  const temporalState = store.temporal.getState()
  temporalState.pause()
  store.setState({ tree })
  temporalState.clear()
  temporalState.resume()
}
