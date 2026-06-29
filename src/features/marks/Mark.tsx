import type { MarkKind, SizeTier } from '../tree/types'
import styles from './Mark.module.css'

interface MarkProps {
  kind: MarkKind
  size: SizeTier
}

export function Mark({ kind, size }: MarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={`${styles.mark} ${styles[`size${size}`]}`}
      data-testid={`mark-${kind}`}
      viewBox={viewBoxFor(kind)}
    >
      {shapeFor(kind)}
    </svg>
  )
}

const viewBoxFor = (kind: MarkKind): string => {
  if (kind === 'arches') {
    return '0 0 92 70'
  }
  if (kind === 'pill') {
    return '0 0 90 60'
  }
  return '0 0 80 80'
}

const shapeFor = (kind: MarkKind) => {
  switch (kind) {
    case 'arrow':
      return (
        <path
          d="M24 24 L54 54 M54 32 L54 54 L32 54"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="10"
        />
      )
    case 'ring':
      return <circle cx="40" cy="40" fill="none" r="27" stroke="currentColor" strokeWidth="13" />
    case 'arches':
      return (
        <>
          <path
            d="M11 60 A34 34 0 0 1 81 60"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="9"
          />
          <path
            d="M27 60 A18 18 0 0 1 65 60"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="9"
          />
        </>
      )
    case 'split':
      return (
        <g transform="rotate(20 40 40)">
          <path d="M41 12 A28 28 0 0 1 41 68 Z" fill="currentColor" />
          <path d="M37 12 A28 28 0 0 0 37 68 Z" fill="currentColor" opacity=".5" />
        </g>
      )
    case 'pill':
      return (
        <rect
          fill="none"
          height="34"
          rx="17"
          stroke="currentColor"
          strokeWidth="9"
          width="74"
          x="8"
          y="13"
        />
      )
    case 'dots':
      return (
        <>
          {DOTS.map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} fill="currentColor" r="6" />
          ))}
        </>
      )
  }
}

const DOTS = [
  [16, 16],
  [40, 16],
  [64, 16],
  [16, 40],
  [40, 40],
  [64, 40],
  [16, 64],
  [40, 64],
  [64, 64],
] as const
