import type { MARK_KINDS, PALETTE } from './visuals'

export type ColorKey = (typeof PALETTE)[number]['key']
export type MarkKind = (typeof MARK_KINDS)[number]
export type SizeTier = 'S' | 'M' | 'L'

export interface Node {
  id: string
  title: string
  subtitle?: string
  colorKey?: ColorKey
  markKind?: MarkKind
  childIds: string[]
  createdAt: number
}

export interface TreeState {
  nodes: Record<string, Node>
  rootIds: string[]
}

export type EditableNodePatch = Partial<Pick<Node, 'title' | 'subtitle' | 'colorKey' | 'markKind'>>
