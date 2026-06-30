import { canStartSwipeBack, shouldTriggerSwipeDownBack } from './swipeBack'

describe('swipeBack', () => {
  it('recognizes a downward swipe with limited horizontal drift', () => {
    expect(
      shouldTriggerSwipeDownBack({
        end: { x: 124, y: 188 },
        start: { x: 100, y: 80 },
      }),
    ).toBe(true)
  })

  it('ignores short, upward, and mostly horizontal gestures', () => {
    expect(
      shouldTriggerSwipeDownBack({
        end: { x: 104, y: 130 },
        start: { x: 100, y: 80 },
      }),
    ).toBe(false)
    expect(
      shouldTriggerSwipeDownBack({
        end: { x: 100, y: 20 },
        start: { x: 100, y: 80 },
      }),
    ).toBe(false)
    expect(
      shouldTriggerSwipeDownBack({
        end: { x: 220, y: 188 },
        start: { x: 100, y: 80 },
      }),
    ).toBe(false)
  })

  it('does not start from interactive elements', () => {
    const button = document.createElement('button')
    const heading = document.createElement('h1')

    expect(canStartSwipeBack(button)).toBe(false)
    expect(canStartSwipeBack(heading)).toBe(true)
  })
})
