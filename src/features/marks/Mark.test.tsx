import { render, screen } from '@testing-library/react'

import { Mark } from './Mark'

describe('Mark', () => {
  it.each(['arrow', 'ring', 'arches', 'split', 'pill', 'dots'] as const)(
    'renders the %s mark as hidden decorative SVG',
    (kind) => {
      render(<Mark kind={kind} size="M" />)

      expect(screen.getByTestId(`mark-${kind}`)).toBeInTheDocument()
      expect(screen.getByTestId(`mark-${kind}`)).toHaveAttribute('aria-hidden', 'true')
    },
  )
})
