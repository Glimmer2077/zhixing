import { render, screen } from '@testing-library/react'

import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('renders the wordmark', () => {
    render(<AppShell />)

    expect(screen.getByRole('heading', { name: '知行' })).toBeInTheDocument()
  })
})
