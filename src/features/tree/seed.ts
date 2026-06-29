import { createId as defaultCreateId, type IdFactory } from '../../lib/id'
import { now as defaultNow, type Clock } from '../../lib/clock'
import { addNode } from './treeOps'
import type { TreeState } from './types'

interface SeedOptions {
  createId?: IdFactory
  now?: Clock
}

interface SeedNode {
  title: string
  subtitle?: string
  children?: SeedNode[]
}

const STARTER_TREE: SeedNode[] = [
  {
    title: '工作',
    subtitle: '专注与产出',
    children: [{ title: '深度工作' }, { title: '沟通协作' }],
  },
  {
    title: '日常',
    subtitle: '照顾好自己',
    children: [{ title: '身体' }, { title: '家' }],
  },
  {
    title: '聊天',
    subtitle: '与人连接',
    children: [{ title: '家人' }, { title: '朋友' }],
  },
  {
    title: '成长',
    subtitle: '成为想成为的人',
    children: [{ title: '阅读' }, { title: '学习' }],
  },
]

export const createSeedTree = (options: SeedOptions = {}): TreeState => {
  const createId = options.createId ?? defaultCreateId
  const getNow = options.now ?? defaultNow

  const addSeedNode = (state: TreeState, parentId: string | null, seed: SeedNode): TreeState => {
    const result = addNode(
      state,
      parentId,
      {
        title: seed.title,
        subtitle: seed.subtitle,
      },
      {
        createId,
        now: getNow,
      },
    )

    return (seed.children ?? []).reduce(
      (nextState, child) => addSeedNode(nextState, result.id, child),
      result.state,
    )
  }

  return STARTER_TREE.reduce<TreeState>((state, seed) => addSeedNode(state, null, seed), {
    nodes: {},
    rootIds: [],
  })
}
