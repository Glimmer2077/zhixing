import type { CSSProperties } from 'react'
import { motion } from 'motion/react'

import { formatDate } from '../../lib/date'
import { Mark } from '../marks/Mark'
import type { Node } from '../tree/types'
import { colorFor, markFor, paletteByKey, sizeFor } from '../tree/visuals'
import styles from './Card.module.css'

interface CardProps {
  node: Node
  onOpen: (id: string) => void
}

type CardStyle = CSSProperties & {
  '--card-fill': string
  '--card-title': string
  '--card-sub': string
  '--card-mark': string
}

export function Card({ node, onOpen }: CardProps) {
  const palette = paletteByKey(colorFor(node))
  const size = sizeFor(node.id)
  const style: CardStyle = {
    '--card-fill': palette.fill,
    '--card-title': palette.title,
    '--card-sub': palette.sub,
    '--card-mark': palette.mark,
  }

  return (
    <motion.button
      aria-label={node.title}
      className={`${styles.card} ${styles[`tier${size}`]}`}
      layoutId={`card-${node.id}`}
      onClick={() => onOpen(node.id)}
      style={style}
      type="button"
      whileTap={{ scale: 0.98 }}
    >
      <span className={styles.text}>
        <span className={styles.title}>{node.title}</span>
        {node.subtitle ? <span className={styles.subtitle}>{node.subtitle}</span> : null}
      </span>
      <span className={styles.markWrap}>
        <Mark kind={markFor(node)} size={size} />
      </span>
      <time className={styles.date} dateTime={new Date(node.createdAt).toISOString()}>
        {formatDate(node.createdAt)}
      </time>
    </motion.button>
  )
}
