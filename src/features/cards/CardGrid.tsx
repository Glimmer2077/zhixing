import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

import { STRINGS } from '../../strings'
import type { Node } from '../tree/types'
import { distribute, totalColumnHeight } from './masonry'
import { Card } from './Card'
import styles from './CardGrid.module.css'

interface CardGridProps {
  nodes: Node[]
  addLabel: string
  onAdd: (title: string) => void
  onEdit: (id: string) => void
  onOpen: (id: string) => void
}

export function CardGrid({ nodes, addLabel, onAdd, onEdit, onOpen }: CardGridProps) {
  const prefersReducedMotion = useReducedMotion()

  if (nodes.length === 0) {
    return (
      <section className={styles.empty} aria-label={STRINGS.cardGrid}>
        <div className={styles.emptyText}>
          <h2>{STRINGS.emptyTitle}</h2>
          <p>{STRINGS.emptyBody}</p>
        </div>
        <AddCard className={styles.emptyAdd} label={STRINGS.addCard} onAdd={onAdd} />
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
                <Card node={node} onEdit={onEdit} onOpen={onOpen} />
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
                <AddCard className={styles.addCard} label={addLabel} onAdd={onAdd} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

interface AddCardProps {
  className: string
  label: string
  onAdd: (title: string) => void
}

function AddCard({ className, label, onAdd }: AddCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')

  const commit = () => {
    const nextTitle = title.trim()
    if (!nextTitle) {
      setTitle('')
      setIsEditing(false)
      return
    }

    onAdd(nextTitle)
    setTitle('')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <form
        className={`${className} ${styles.addForm}`}
        onSubmit={(event) => {
          event.preventDefault()
          commit()
        }}
      >
        <input
          aria-label={STRINGS.addInputLabel}
          autoFocus
          value={title}
          onBlur={commit}
          onChange={(event) => setTitle(event.target.value)}
        />
      </form>
    )
  }

  return (
    <button className={className} onClick={() => setIsEditing(true)} type="button">
      {label}
    </button>
  )
}
