import type { CSSProperties, ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Card } from './Card'
import type { Node } from '../tree/types'

const motionState = vi.hoisted(() => ({ prefersReducedMotion: false }))

vi.mock('motion/react', async () => {
  const React = await import('react')

  return {
    motion: {
      article: ({
        children,
        className,
        layoutId,
        style,
        whileTap,
      }: {
        children?: ReactNode
        className?: string
        layoutId?: string
        style?: CSSProperties
        whileTap?: unknown
      }) =>
        React.createElement(
          'article',
          {
            className,
            'data-layout-id': layoutId,
            'data-testid': 'motion-card',
            'data-while-tap': whileTap ? JSON.stringify(whileTap) : '',
            style,
          },
          children,
        ),
    },
    useReducedMotion: () => motionState.prefersReducedMotion,
  }
})

const node: Node = {
  id: 'work',
  title: '工作',
  subtitle: '专注与产出',
  childIds: [],
  createdAt: Date.UTC(2026, 5, 29, 12),
}

describe('Card', () => {
  beforeEach(() => {
    motionState.prefersReducedMotion = false
  })

  it('renders node title, subtitle, date, and mark', () => {
    render(<Card node={node} onEdit={() => undefined} onOpen={() => undefined} />)

    expect(screen.getByRole('button', { name: '工作' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '编辑 工作' })).toBeInTheDocument()
    expect(screen.getByText('专注与产出')).toBeInTheDocument()
    expect(screen.getByText('2026.6.29')).toBeInTheDocument()
    expect(screen.getByTestId(/^mark-/)).toBeInTheDocument()
  })

  it('opens the card when clicked', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()

    render(<Card node={node} onEdit={() => undefined} onOpen={onOpen} />)
    await user.click(screen.getByRole('button', { name: '工作' }))

    expect(onOpen).toHaveBeenCalledWith('work')
  })

  it('opens the edit affordance when clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(<Card node={node} onEdit={onEdit} onOpen={() => undefined} />)
    await user.click(screen.getByRole('button', { name: '编辑 工作' }))

    expect(onEdit).toHaveBeenCalledWith('work')
  })

  it('does not configure tap scaling when reduced motion is requested', () => {
    motionState.prefersReducedMotion = true

    render(<Card node={node} onEdit={() => undefined} onOpen={() => undefined} />)

    expect(screen.getByTestId('motion-card')).toHaveAttribute('data-while-tap', '')
  })
})
