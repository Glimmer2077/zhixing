import { z } from 'zod'

import { MARK_KINDS, PALETTE } from './visuals'
import type { TreeState } from './types'

const ColorKeySchema = z.enum(PALETTE.map((entry) => entry.key))
const MarkKindSchema = z.enum(MARK_KINDS)

export const NodeSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  subtitle: z.string().optional(),
  colorKey: ColorKeySchema.optional(),
  markKind: MarkKindSchema.optional(),
  childIds: z.array(z.string()),
  createdAt: z.number().int(),
})

export const TreeSchema = z.object({
  version: z.literal(1),
  nodes: z.record(z.string(), NodeSchema),
  rootIds: z.array(z.string()),
})

export type TreeExport = z.infer<typeof TreeSchema>

export const validateTreeInvariant = (input: unknown): TreeState => {
  const parsed = TreeSchema.parse(input)
  const seen = new Set<string>()
  const visiting = new Set<string>()
  const visited = new Set<string>()

  for (const [nodeId, node] of Object.entries(parsed.nodes)) {
    if (node.id !== nodeId) {
      throw new Error(`Node key mismatch: ${nodeId} !== ${node.id}`)
    }
  }

  const visit = (nodeId: string) => {
    if (!parsed.nodes[nodeId]) {
      throw new Error(`Missing node reference: ${nodeId}`)
    }
    if (visiting.has(nodeId)) {
      throw new Error(`Cycle detected at node: ${nodeId}`)
    }
    if (visited.has(nodeId)) {
      throw new Error(`Duplicate node reference: ${nodeId}`)
    }

    seen.add(nodeId)
    visiting.add(nodeId)
    for (const childId of parsed.nodes[nodeId].childIds) {
      visit(childId)
    }
    visiting.delete(nodeId)
    visited.add(nodeId)
  }

  for (const rootId of parsed.rootIds) {
    if (seen.has(rootId)) {
      throw new Error(`Duplicate node reference: ${rootId}`)
    }
    visit(rootId)
  }

  for (const nodeId of Object.keys(parsed.nodes)) {
    if (!seen.has(nodeId)) {
      throw new Error(`Orphan node: ${nodeId}`)
    }
  }

  return {
    nodes: parsed.nodes,
    rootIds: parsed.rootIds,
  }
}
