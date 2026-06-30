import { useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'

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
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const palette = paletteByKey(colorFor(node))
  const size = sizeFor(node.id)
  const style: CardStyle = {
    '--card-fill': palette.fill,
    '--card-title': palette.title,
    '--card-sub': palette.sub,
    '--card-mark': palette.mark,
  }

  const startLongPress = (event: ReactPointerEvent<HTMLButtonElement>) => {
    pointerStart.current = { x: event.clientX, y: event.clientY }
    longPressTimer.current = window.setTimeout(() => {
      longPressTimer.current = null
      onEdit(node.id)
    }, 400)
  }

  const clearLongPress = () => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    pointerStart.current = null
  }

  const cancelLongPressOnMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!pointerStart.current) {
      return
    }

    const deltaX = Math.abs(event.clientX - pointerStart.current.x)
    const deltaY = Math.abs(event.clientY - pointerStart.current.y)
    if (deltaX > 8 || deltaY > 8) {
      clearLongPress()
    }
  }

  return (
    <motion.article
      className={`${styles.card} ${styles[`tier${size}`]}`}
      layoutId={`card-${node.id}`}
      style={style}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
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
        onPointerMove={cancelLongPressOnMove}
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
      </button>
    </motion.article>
  )
}
