import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Card } from './Card'
import type { Node } from '../tree/types'

const node: Node = {
  id: 'work',
  title: '工作',
  subtitle: '专注与产出',
  childIds: [],
  createdAt: Date.UTC(2026, 5, 29, 12),
}

describe('Card', () => {
  it('renders node title, subtitle, date, and mark', () => {
    render(<Card node={node} onOpen={() => undefined} />)

    expect(screen.getByRole('button', { name: '工作' })).toBeInTheDocument()
    expect(screen.getByText('专注与产出')).toBeInTheDocument()
    expect(screen.getByText('2026.6.29')).toBeInTheDocument()
    expect(screen.getByTestId(/^mark-/)).toBeInTheDocument()
  })

  it('opens the card when clicked', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()

    render(<Card node={node} onOpen={onOpen} />)
    await user.click(screen.getByRole('button', { name: '工作' }))

    expect(onOpen).toHaveBeenCalledWith('work')
  })
})
