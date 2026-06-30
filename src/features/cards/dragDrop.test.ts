import type { DragMoveEvent } from '@dnd-kit/core'

import {
  dragPointFromEvent,
  pointerPointFromEvent,
  reparentTargetFor,
  shouldReorder,
} from './dragDrop'

describe('drag drop intent helpers', () => {
  it('falls back to reorder when no pointer or target is available', () => {
    expect(shouldReorder(dragEvent({ overId: null }), new Map(), null)).toBe(true)
    expect(
      shouldReorder(dragEvent({ activatorEvent: new Event('keydown') }), new Map(), null),
    ).toBe(true)
  })

  it('classifies top-zone drops as reorder and middle-card drops as reparent', () => {
    expect(
      shouldReorder(dragEvent({ overId: 'daily' }), new Map(), {
        x: 120,
        y: 40,
      }),
    ).toBe(true)
    expect(
      shouldReorder(dragEvent({ overId: 'daily' }), new Map(), {
        x: 80,
        y: 100,
      }),
    ).toBe(false)
  })

  it('returns a reparent target only for card-body drops', () => {
    expect(
      reparentTargetFor(dragEvent({ activeId: 'work', overId: 'work' }), new Map(), null),
    ).toBe(null)
    expect(
      reparentTargetFor(dragEvent({ activeId: 'work', overId: 'daily' }), new Map(), {
        x: 80,
        y: 100,
      }),
    ).toBe('daily')
    expect(
      reparentTargetFor(dragEvent({ activeId: 'work', overId: 'daily' }), new Map(), {
        x: 20,
        y: 20,
      }),
    ).toBe(null)
  })

  it('derives a drag point from the activator event and delta', () => {
    expect(
      dragPointFromEvent(
        dragEvent({
          activatorEvent: new MouseEvent('pointerdown', { clientX: 20, clientY: 24 }),
          delta: { x: 10, y: 12 },
        }),
      ),
    ).toEqual({ x: 30, y: 36 })
    expect(pointerPointFromEvent(new Event('keydown'))).toBeNull()
  })
})

function dragEvent({
  activeId = 'work',
  activatorEvent = new MouseEvent('pointerdown', { clientX: 8, clientY: 8 }),
  delta = { x: 0, y: 0 },
  overId = 'daily',
}: {
  activeId?: string
  activatorEvent?: Event
  delta?: { x: number; y: number }
  overId?: string | null
} = {}): DragMoveEvent {
  return {
    active: { id: activeId },
    activatorEvent,
    collisions: null,
    delta,
    over: overId
      ? {
          data: { current: undefined },
          disabled: false,
          id: overId,
          rect: new DOMRect(0, 0, 160, 180),
        }
      : null,
  } as unknown as DragMoveEvent
}
