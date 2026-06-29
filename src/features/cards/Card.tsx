import { useRef, type CSSProperties } from 'react'
import { motion } from 'motion/react'

import { formatDate } from '../../lib/date'
import { STRINGS } from '../../strings'
import { Mark } from '../marks/Mark'
import type { Node } from '../tree/types'
import { colorFor, markFor, paletteByKey, sizeFor } from '../tree/visuals'
import styles from './Card.module.css'

interface CardProps {
  node: Node
  onEdit: (id: string) => void
  onOpen: (id: string) => void
}

type CardStyle = CSSProperties & {
  '--card-fill': string
  '--card-title': string
  '--card-sub': string
  '--card-mark': string
}

export function Card({ node, onEdit, onOpen }: CardProps) {
  const longPressTimer = useRef<number | null>(null)
  const palette = paletteByKey(colorFor(node))
  const size = sizeFor(node.id)
  const style: CardStyle = {
    '--card-fill': palette.fill,
    '--card-title': palette.title,
    '--card-sub': palette.sub,
    '--card-mark': palette.mark,
  }

  const startLongPress = () => {
    longPressTimer.current = window.setTimeout(() => onEdit(node.id), 400)
  }

  const clearLongPress = () => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  return (
    <motion.article
      className={`${styles.card} ${styles[`tier${size}`]}`}
      layoutId={`card-${node.id}`}
      style={style}
      whileTap={{ scale: 0.98 }}
    >
      <button
        aria-label={node.title}
        className={styles.openButton}
        onClick={() => onOpen(node.id)}
        onContextMenu={(event) => {
          event.preventDefault()
          onEdit(node.id)
        }}
        onPointerCancel={clearLongPress}
        onPointerDown={startLongPress}
        onPointerLeave={clearLongPress}
        onPointerUp={clearLongPress}
        type="button"
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
      </button>
      <button
        aria-label={`${STRINGS.edit} ${node.title}`}
        className={styles.editButton}
        onClick={() => onEdit(node.id)}
        type="button"
      >
        <span aria-hidden="true">…</span>
      </button>
    </motion.article>
  )
}
