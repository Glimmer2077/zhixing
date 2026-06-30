import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useRef, useState } from 'react'

import { STRINGS } from '../../strings'
import type { Node } from '../tree/types'
import { reparentTargetFor, shouldReorder } from './dragDrop'
import { distribute, totalColumnHeight } from './masonry'
import { Card } from './Card'
import styles from './CardGrid.module.css'

interface CardGridProps {
  nodes: Node[]
  addLabel: string
  onAdd: (title: string) => void
  onEdit: (id: string) => void
  onOpen: (id: string) => void
  onReparent: (activeId: string, targetParentId: string) => void
  onReorder: (activeId: string, overId: string) => void
}

export function CardGrid({
  nodes,
  addLabel,
  onAdd,
  onEdit,
  onOpen,
  onReparent,
  onReorder,
}: CardGridProps) {
  const dragHandleRefs = useRef(new Map<string, HTMLButtonElement>())
  const lastPointerPointRef = useRef<{ x: number; y: number } | null>(null)
  const [reparentTargetId, setReparentTargetId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const itemIds = nodes.map((node) => node.id)

  useEffect(() => {
    const trackPointer = (event: MouseEvent | PointerEvent) => {
      lastPointerPointRef.current = { x: event.clientX, y: event.clientY }
    }

    const trackTouch = (event: TouchEvent) => {
      const touch = event.touches[0] ?? event.changedTouches[0]
      if (touch) {
        lastPointerPointRef.current = { x: touch.clientX, y: touch.clientY }
      }
    }

    window.addEventListener('mousemove', trackPointer)
    window.addEventListener('pointermove', trackPointer)
    window.addEventListener('touchmove', trackTouch, { passive: true })
    return () => {
      window.removeEventListener('mousemove', trackPointer)
      window.removeEventListener('pointermove', trackPointer)
      window.removeEventListener('touchmove', trackTouch)
    }
  }, [])

  const handleDragMove = (event: DragMoveEvent) => {
    setReparentTargetId(
      reparentTargetFor(event, dragHandleRefs.current, lastPointerPointRef.current),
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setReparentTargetId(null)
    if (!over || active.id === over.id) {
      return
    }

    const activeId = String(active.id)
    const targetId = String(over.id)
    if (shouldReorder(event, dragHandleRefs.current, lastPointerPointRef.current)) {
      onReorder(activeId, targetId)
      return
    }

    onReparent(activeId, targetId)
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
    <DndContext
      collisionDetection={closestCenter}
      onDragCancel={() => setReparentTargetId(null)}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      sensors={sensors}
    >
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div className={styles.grid} role="list" aria-label={STRINGS.cardGrid}>
          {columns.map((column, columnIndex) => (
            <div className={styles.column} key={columnIndex}>
              {column.map((node) => (
                <SortableCardItem
                  isReparentTarget={reparentTargetId === node.id}
                  key={node.id}
                  node={node}
                  onEdit={onEdit}
                  onOpen={onOpen}
                  onRegisterDragHandle={(element) => {
                    if (element) {
                      dragHandleRefs.current.set(node.id, element)
                      return
                    }
                    dragHandleRefs.current.delete(node.id)
                  }}
                />
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
  isReparentTarget: boolean
  node: Node
  onEdit: (id: string) => void
  onOpen: (id: string) => void
  onRegisterDragHandle: (element: HTMLButtonElement | null) => void
}

function SortableCardItem({
  isReparentTarget,
  node,
  onEdit,
  onOpen,
  onRegisterDragHandle,
}: SortableCardItemProps) {
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
      } ${isReparentTarget ? styles.reparentTarget : ''}`.trim()}
      data-reparent-target-id={node.id}
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
        ref={(element) => {
          setActivatorNodeRef(element)
          onRegisterDragHandle(element)
        }}
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
