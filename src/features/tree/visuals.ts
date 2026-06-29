import type { ColorKey, MarkKind, Node, SizeTier } from './types'

export const PALETTE = [
  { key: 'sand', fill: '#ECE5D4', title: '#5F5440', sub: '#8A7C62', mark: '#CFC2A2' },
  { key: 'sage', fill: '#D4D9C8', title: '#4C5742', sub: '#6E795F', mark: '#ABB79B' },
  { key: 'mist', fill: '#CCD4D9', title: '#44535C', sub: '#65737C', mark: '#A6B3BB' },
  { key: 'clay', fill: '#E3CEBE', title: '#6B4E3B', sub: '#91705A', mark: '#C6A78D' },
  { key: 'lilac', fill: '#D6CEDA', title: '#534862', sub: '#786C86', mark: '#B4A7BD' },
  { key: 'straw', fill: '#E4DAAE', title: '#5E5520', sub: '#837843', mark: '#C9BD84' },
  { key: 'rose', fill: '#E0CCCB', title: '#674746', sub: '#8C6A69', mark: '#C2A2A1' },
  { key: 'stone', fill: '#DBD4C9', title: '#585042', sub: '#7C7363', mark: '#BDB3A1' },
] as const

export const MARK_KINDS = ['arrow', 'ring', 'arches', 'split', 'pill', 'dots'] as const

export const SIZE_TIERS = ['S', 'M', 'L'] as const

export const hash = (value: string): number => {
  let result = 2_166_136_261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16_777_619)
  }
  return result >>> 0
}

export const colorFor = (node: Node): ColorKey =>
  node.colorKey ?? PALETTE[hash(node.id) % PALETTE.length].key

export const markFor = (node: Node): MarkKind =>
  node.markKind ?? MARK_KINDS[hash(`${node.id}m`) % MARK_KINDS.length]

export const sizeFor = (id: string): SizeTier => SIZE_TIERS[hash(`${id}s`) % SIZE_TIERS.length]

export const paletteByKey = (key: ColorKey) => {
  const entry = PALETTE.find((item) => item.key === key)
  if (!entry) {
    throw new Error(`Unknown palette key: ${key}`)
  }
  return entry
}
