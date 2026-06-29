import type { TreeState } from '../tree/types'
import { exportTreeToJson, importTreeFromJson } from './treeTransfer'

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

describe('treeTransfer', () => {
  it('exports a tree as a stable v1 JSON payload', () => {
    expect(JSON.parse(exportTreeToJson(tree))).toEqual({
      version: 1,
      rootIds: ['work'],
      nodes: tree.nodes,
    })
  })

  it('imports valid v1 JSON payloads', () => {
    expect(importTreeFromJson(exportTreeToJson(tree))).toEqual(tree)
  })

  it('rejects malformed JSON and invalid tree payloads', () => {
    expect(() => importTreeFromJson('{')).toThrow('Invalid JSON')
    expect(() =>
      importTreeFromJson(JSON.stringify({ version: 1, nodes: {}, rootIds: ['missing'] })),
    ).toThrow('Invalid tree')
  })
})
