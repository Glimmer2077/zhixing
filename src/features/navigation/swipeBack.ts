export interface SwipePoint {
  x: number
  y: number
}

interface SwipeIntent {
  end: SwipePoint
  start: SwipePoint
}

const MIN_VERTICAL_DISTANCE = 88
const MAX_HORIZONTAL_DRIFT = 80
const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="dialog"]',
].join(',')

export const shouldTriggerSwipeDownBack = ({ end, start }: SwipeIntent): boolean => {
  const deltaY = end.y - start.y
  const deltaX = Math.abs(end.x - start.x)
  return deltaY >= MIN_VERTICAL_DISTANCE && deltaX <= MAX_HORIZONTAL_DRIFT
}

export const canStartSwipeBack = (target: EventTarget | null): boolean =>
  target instanceof Element && !target.closest(INTERACTIVE_SELECTOR)
