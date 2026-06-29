import { createId as defaultCreateId, type IdFactory } from '../../lib/id'
import { now as defaultNow, type Clock } from '../../lib/clock'
import type { EditableNodePatch, Node, TreeState } from './types'

interface AddNodeOptions {
  createId?: IdFactory
  now?: Clock
}

export class TreeCycleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TreeCycleError'
  }
}

export const addNode = (
  state: TreeState,
  parentId: string | null,
  init: Partial<Node> = {},
  options: AddNodeOptions = {},
): { state: TreeState; id: string } => {
  if (parentId !== null && !state.nodes[parentId]) {
    return { state, id: init.id ?? '' }
  }

  const id = init.id ?? options.createId?.() ?? defaultCreateId()
  const node: Node = {
    id,
    title: init.title ?? '',
    childIds: init.childIds ? [...init.childIds] : [],
    createdAt: init.createdAt ?? options.now?.() ?? defaultNow(),
    ...(init.subtitle !== undefined ? { subtitle: init.subtitle } : {}),
    ...(init.colorKey !== undefined ? { colorKey: init.colorKey } : {}),
    ...(init.markKind !== undefined ? { markKind: init.markKind } : {}),
  }

  const nodes = { ...state.nodes, [id]: node }
  if (parentId === null) {
    return { id, state: { nodes, rootIds: [...state.rootIds, id] } }
  }

  return {
    id,
    state: {
      rootIds: state.rootIds,
      nodes: {
        ...nodes,
        [parentId]: {
          ...state.nodes[parentId],
          childIds: [...state.nodes[parentId].childIds, id],
        },
      },
    },
  }
}

export const updateNode = (state: TreeState, id: string, patch: EditableNodePatch): TreeState => {
  const node = state.nodes[id]
  if (!node) {
    return state
  }

  const updated: Node = { ...node }
  if ('title' in patch && patch.title !== undefined) {
    updated.title = patch.title
  }
  applyOptionalField(updated, patch, 'subtitle')
  applyOptionalField(updated, patch, 'colorKey')
  applyOptionalField(updated, patch, 'markKind')

  return {
    rootIds: state.rootIds,
    nodes: {
      ...state.nodes,
      [id]: updated,
    },
  }
}

export const removeNode = (state: TreeState, id: string): TreeState => {
  if (!state.nodes[id]) {
    return state
  }

  const idsToRemove = collectSubtreeIds(state, id)
  const nodes = { ...state.nodes }
  for (const nodeId of idsToRemove) {
    delete nodes[nodeId]
  }

  const parentId = parentOf(state, id)
  if (parentId === null) {
    return {
      nodes,
      rootIds: state.rootIds.filter((rootId) => rootId !== id),
    }
  }
  if (parentId === undefined) {
    return { nodes, rootIds: state.rootIds }
  }

  nodes[parentId] = {
    ...state.nodes[parentId],
    childIds: state.nodes[parentId].childIds.filter((childId) => childId !== id),
  }

  return { nodes, rootIds: state.rootIds }
}

export const moveNode = (
  state: TreeState,
  id: string,
  newParentId: string | null,
  index: number,
): TreeState => {
  if (!state.nodes[id] || (newParentId !== null && !state.nodes[newParentId])) {
    return state
  }
  if (id === newParentId || (newParentId !== null && isDescendant(state, id, newParentId))) {
    throw new TreeCycleError(`Cannot move node ${id} into itself or its descendants`)
  }

  const currentParentId = parentOf(state, id)
  if (currentParentId === undefined) {
    return state
  }

  const detached = detachNodeReference(state, id, currentParentId)
  return attachNodeReference(detached, id, newParentId, index)
}

export const reorder = (
  state: TreeState,
  parentId: string | null,
  fromIndex: number,
  toIndex: number,
): TreeState => {
  const ids = idsForParent(state, parentId)
  if (!ids || fromIndex < 0 || fromIndex >= ids.length) {
    return state
  }

  const nextIds = [...ids]
  const [moved] = nextIds.splice(fromIndex, 1)
  nextIds.splice(clampIndex(toIndex, nextIds.length), 0, moved)
  return replaceParentIds(state, parentId, nextIds)
}

export const childrenOf = (state: TreeState, parentId: string | null): Node[] => {
  const ids = idsForParent(state, parentId) ?? []
  return ids.map((id) => state.nodes[id]).filter((node): node is Node => Boolean(node))
}

export const pathTo = (state: TreeState, id: string): Node[] => {
  const visit = (nodeId: string, path: Node[]): Node[] => {
    const node = state.nodes[nodeId]
    if (!node) {
      return []
    }
    const nextPath = [...path, node]
    if (nodeId === id) {
      return nextPath
    }

    for (const childId of node.childIds) {
      const found = visit(childId, nextPath)
      if (found.length > 0) {
        return found
      }
    }
    return []
  }

  for (const rootId of state.rootIds) {
    const found = visit(rootId, [])
    if (found.length > 0) {
      return found
    }
  }
  return []
}

export const isDescendant = (state: TreeState, maybeAncestor: string, id: string): boolean => {
  const ancestor = state.nodes[maybeAncestor]
  if (!ancestor) {
    return false
  }

  const pending = [...ancestor.childIds]
  while (pending.length > 0) {
    const nextId = pending.shift()
    if (!nextId) {
      continue
    }
    if (nextId === id) {
      return true
    }
    pending.push(...(state.nodes[nextId]?.childIds ?? []))
  }
  return false
}

const applyOptionalField = <K extends keyof Pick<Node, 'subtitle' | 'colorKey' | 'markKind'>>(
  node: Node,
  patch: EditableNodePatch,
  key: K,
) => {
  if (!(key in patch)) {
    return
  }
  if (patch[key] === undefined) {
    delete node[key]
    return
  }
  node[key] = patch[key]
}

const parentOf = (state: TreeState, id: string): string | null | undefined => {
  if (state.rootIds.includes(id)) {
    return null
  }
  for (const node of Object.values(state.nodes)) {
    if (node.childIds.includes(id)) {
      return node.id
    }
  }
  return undefined
}

const collectSubtreeIds = (state: TreeState, id: string): Set<string> => {
  const ids = new Set<string>()
  const visit = (nodeId: string) => {
    if (ids.has(nodeId)) {
      return
    }
    ids.add(nodeId)
    for (const childId of state.nodes[nodeId]?.childIds ?? []) {
      visit(childId)
    }
  }
  visit(id)
  return ids
}

const idsForParent = (state: TreeState, parentId: string | null): string[] | undefined =>
  parentId === null ? state.rootIds : state.nodes[parentId]?.childIds

const replaceParentIds = (state: TreeState, parentId: string | null, ids: string[]): TreeState => {
  if (parentId === null) {
    return { nodes: state.nodes, rootIds: ids }
  }

  const parent = state.nodes[parentId]
  if (!parent) {
    return state
  }

  return {
    rootIds: state.rootIds,
    nodes: {
      ...state.nodes,
      [parentId]: {
        ...parent,
        childIds: ids,
      },
    },
  }
}

const detachNodeReference = (state: TreeState, id: string, parentId: string | null): TreeState => {
  const ids = idsForParent(state, parentId)
  if (!ids) {
    return state
  }
  return replaceParentIds(
    state,
    parentId,
    ids.filter((childId) => childId !== id),
  )
}

const attachNodeReference = (
  state: TreeState,
  id: string,
  parentId: string | null,
  index: number,
): TreeState => {
  const ids = idsForParent(state, parentId)
  if (!ids) {
    return state
  }

  const nextIds = [...ids]
  nextIds.splice(clampIndex(index, nextIds.length), 0, id)
  return replaceParentIds(state, parentId, nextIds)
}

const clampIndex = (index: number, length: number): number => {
  if (Number.isNaN(index)) {
    return length
  }
  return Math.min(Math.max(index, 0), length)
}
