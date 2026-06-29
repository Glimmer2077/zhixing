import { TreeSchema, validateTreeInvariant } from './schema'
import type { TreeState } from './types'

const validExport = {
  version: 1,
  rootIds: ['root'],
  nodes: {
    root: {
      id: 'root',
      title: '工作',
      childIds: ['child'],
      createdAt: 100,
    },
    child: {
      id: 'child',
      title: '深度工作',
      childIds: [],
      createdAt: 110,
    },
  },
} as const

describe('TreeSchema', () => {
  it('accepts a valid v1 export payload', () => {
    expect(TreeSchema.parse(validExport)).toEqual(validExport)
  })

  it('rejects unsupported versions', () => {
    expect(() => TreeSchema.parse({ ...validExport, version: 2 })).toThrow()
  })
})

describe('validateTreeInvariant', () => {
  it('accepts a structurally valid tree', () => {
    expect(validateTreeInvariant(validExport)).toEqual({
      nodes: validExport.nodes,
      rootIds: validExport.rootIds,
    })
  })

  it('rejects missing child references', () => {
    const invalid = {
      ...validExport,
      nodes: {
        root: { ...validExport.nodes.root, childIds: ['missing'] },
      },
    }

    expect(() => validateTreeInvariant(invalid)).toThrow('Missing node reference: missing')
  })

  it('rejects node records whose key does not match the node id', () => {
    const invalid = {
      ...validExport,
      nodes: {
        root: {
          ...validExport.nodes.root,
          id: 'other',
        },
        child: validExport.nodes.child,
      },
    }

    expect(() => validateTreeInvariant(invalid)).toThrow('Node key mismatch: root !== other')
  })

  it('rejects duplicate references', () => {
    const invalid = {
      ...validExport,
      rootIds: ['root', 'root'],
    }

    expect(() => validateTreeInvariant(invalid)).toThrow('Duplicate node reference: root')
  })

  it('rejects a child referenced by two parents', () => {
    const invalid = {
      version: 1,
      rootIds: ['left', 'right'],
      nodes: {
        left: {
          id: 'left',
          title: 'Left',
          childIds: ['shared'],
          createdAt: 100,
        },
        right: {
          id: 'right',
          title: 'Right',
          childIds: ['shared'],
          createdAt: 101,
        },
        shared: {
          id: 'shared',
          title: 'Shared',
          childIds: [],
          createdAt: 102,
        },
      },
    }

    expect(() => validateTreeInvariant(invalid)).toThrow('Duplicate node reference: shared')
  })

  it('rejects cycles', () => {
    const invalid: { version: 1; nodes: TreeState['nodes']; rootIds: string[] } = {
      version: 1,
      rootIds: ['root'],
      nodes: {
        root: {
          id: 'root',
          title: 'Root',
          childIds: ['child'],
          createdAt: 100,
        },
        child: {
          id: 'child',
          title: 'Child',
          childIds: ['root'],
          createdAt: 110,
        },
      },
    }

    expect(() => validateTreeInvariant(invalid)).toThrow('Cycle detected at node: root')
  })

  it('rejects orphan nodes', () => {
    const invalid = {
      ...validExport,
      nodes: {
        ...validExport.nodes,
        orphan: {
          id: 'orphan',
          title: '孤儿',
          childIds: [],
          createdAt: 120,
        },
      },
    }

    expect(() => validateTreeInvariant(invalid)).toThrow('Orphan node: orphan')
  })
})
