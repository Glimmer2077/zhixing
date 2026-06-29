import { sizeFor } from '../tree/visuals'
import type { Node, SizeTier } from '../tree/types'

export const TIER_H: Record<SizeTier, number> = {
  S: 152,
  M: 180,
  L: 212,
}

export const MASONRY_GAP = 12

export const distribute = (nodes: Node[]): [Node[], Node[]] => {
  const columns: [Node[], Node[]] = [[], []]
  const heights: [number, number] = [0, 0]

  for (const node of nodes) {
    const columnIndex = heights[0] <= heights[1] ? 0 : 1
    columns[columnIndex] = [...columns[columnIndex], node]
    heights[columnIndex] += TIER_H[sizeFor(node.id)] + MASONRY_GAP
  }

  return columns
}

export const totalColumnHeight = (nodes: Node[]): number => {
  if (nodes.length === 0) {
    return 0
  }

  return (
    nodes.reduce((height, node) => height + TIER_H[sizeFor(node.id)], 0) +
    MASONRY_GAP * (nodes.length - 1)
  )
}
