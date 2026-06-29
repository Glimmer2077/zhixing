import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
  onReorder: (activeId: string, overId: string) => void
}

export function CardGrid({ nodes, addLabel, onAdd, onEdit, onOpen, onReorder }: CardGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const itemIds = nodes.map((node) => node.id)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return
    }

    onReorder(String(active.id), String(over.id))
  }

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
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div className={styles.grid} role="list" aria-label={STRINGS.cardGrid}>
          {columns.map((column, columnIndex) => (
            <div className={styles.column} key={columnIndex}>
              {column.map((node) => (
                <SortableCardItem key={node.id} node={node} onEdit={onEdit} onOpen={onOpen} />
              ))}
              {addColumn === columnIndex ? (
                <div className={styles.item} key="add" role="listitem">
                  <AddCard className={styles.addCard} label={addLabel} onAdd={onAdd} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

interface SortableCardItemProps {
  node: Node
  onEdit: (id: string) => void
  onOpen: (id: string) => void
}

function SortableCardItem({ node, onEdit, onOpen }: SortableCardItemProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: node.id })

  return (
    <div
      className={`${styles.item} ${styles.sortableItem} ${
        isDragging ? styles.dragging : ''
      }`.trim()}
      ref={setNodeRef}
      role="listitem"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <Card node={node} onEdit={onEdit} onOpen={onOpen} />
      <button
        {...attributes}
        {...listeners}
        aria-label={`${STRINGS.reorder} ${node.title}`}
        className={styles.dragHandle}
        ref={setActivatorNodeRef}
        type="button"
      >
        <span aria-hidden="true">⋮⋮</span>
      </button>
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
