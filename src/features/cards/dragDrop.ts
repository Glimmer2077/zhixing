import type { DragEndEvent, DragMoveEvent } from '@dnd-kit/core'

import { dropIntentForPoint } from './dropIntent'

export interface Point {
  x: number
  y: number
}

export const reparentTargetFor = (
  event: DragMoveEvent,
  dragHandles: Map<string, HTMLButtonElement>,
  currentPointerPoint: Point | null,
): string | null => {
  const { active, over } = event
  if (!over || active.id === over.id) {
    return null
  }

  return shouldReorder(event, dragHandles, currentPointerPoint) ? null : String(over.id)
}

export const shouldReorder = (
  event: DragMoveEvent | DragEndEvent,
  dragHandles: Map<string, HTMLButtonElement>,
  currentPointerPoint: Point | null,
) => {
  const point = currentPointerPoint ?? dragPointFromEvent(event)
  const over = event.over
  if (!point || !over) {
    return true
  }

  const targetHandle = dragHandles.get(String(over.id))
  if (!targetHandle) {
    return true
  }

  return dropIntentForPoint(point, targetHandle.getBoundingClientRect(), over.rect) === 'reorder'
}

export const dragPointFromEvent = (event: DragMoveEvent | DragEndEvent): Point | null => {
  const start = pointerPointFromEvent(event.activatorEvent)
  if (!start) {
    return null
  }

  return {
    x: start.x + event.delta.x,
    y: start.y + event.delta.y,
  }
}

export const pointerPointFromEvent = (event: Event): Point | null => {
  if (
    event instanceof MouseEvent ||
    (typeof PointerEvent !== 'undefined' && event instanceof PointerEvent)
  ) {
    return { x: event.clientX, y: event.clientY }
  }
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    const touch = event.touches[0] ?? event.changedTouches[0]
    return touch ? { x: touch.clientX, y: touch.clientY } : null
  }
  return null
}
