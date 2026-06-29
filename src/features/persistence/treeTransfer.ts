import { validateTreeInvariant } from '../tree/schema'
import type { TreeState } from '../tree/types'
import { toStoredTree } from './treeStorage'

export const exportTreeToJson = (tree: TreeState): string =>
  `${JSON.stringify(toStoredTree(tree), null, 2)}\n`

export const importTreeFromJson = (source: string): TreeState => {
  let parsed: unknown
  try {
    parsed = JSON.parse(source)
  } catch {
    throw new Error('Invalid JSON')
  }

  try {
    return validateTreeInvariant(parsed)
  } catch {
    throw new Error('Invalid tree')
  }
}
