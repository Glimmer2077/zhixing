import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { STRINGS } from '../../strings'
import type { Node } from '../tree/types'
import { distribute, totalColumnHeight } from './masonry'
import { Card } from './Card'
import styles from './CardGrid.module.css'

interface CardGridProps {
  nodes: Node[]
  addLabel: string
  onOpen: (id: string) => void
}

export function CardGrid({ nodes, addLabel, onOpen }: CardGridProps) {
  const prefersReducedMotion = useReducedMotion()

  if (nodes.length === 0) {
    return (
      <section className={styles.empty} aria-label={STRINGS.cardGrid}>
        <div className={styles.emptyText}>
          <h2>{STRINGS.emptyTitle}</h2>
          <p>{STRINGS.emptyBody}</p>
        </div>
        <button className={styles.emptyAdd} disabled type="button">
          {STRINGS.addCard}
        </button>
      </section>
    )
  }

  const columns = distribute(nodes)
  const addColumn = totalColumnHeight(columns[0]) <= totalColumnHeight(columns[1]) ? 0 : 1

  return (
    <div className={styles.grid} role="list" aria-label={STRINGS.cardGrid}>
      {columns.map((column, columnIndex) => (
        <div className={styles.column} key={columnIndex}>
          <AnimatePresence initial={false}>
            {column.map((node, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className={styles.item}
                exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                key={node.id}
                role="listitem"
                transition={{
                  delay: prefersReducedMotion ? 0 : index * 0.04,
                  duration: prefersReducedMotion ? 0 : 0.2,
                }}
              >
                <Card node={node} onOpen={onOpen} />
              </motion.div>
            ))}
            {addColumn === columnIndex ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className={styles.item}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                key="add"
                role="listitem"
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              >
                <button className={styles.addCard} disabled type="button">
                  {addLabel}
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
