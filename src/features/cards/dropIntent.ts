export type DropIntent = 'reorder' | 'reparent'

export interface RectLike {
  bottom: number
  left: number
  right: number
  top: number
}

const REORDER_ZONE_HEIGHT = 56

export const dropIntentForPoint = (
  point: { x: number; y: number },
  targetHandleRect: RectLike,
  targetRect?: RectLike,
): DropIntent =>
  pointInRect(point, targetHandleRect) ||
  Boolean(targetRect && pointInRect(point, topReorderZone(targetRect)))
    ? 'reorder'
    : 'reparent'

const pointInRect = (point: { x: number; y: number }, rect: RectLike) =>
  point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom

const topReorderZone = (rect: RectLike): RectLike => ({
  bottom: Math.min(rect.bottom, rect.top + REORDER_ZONE_HEIGHT),
  left: rect.left,
  right: rect.right,
  top: rect.top,
})
