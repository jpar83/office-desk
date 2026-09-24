import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './main'

afterEach(() => { cleanup(); location.hash = '#/'; localStorage.clear() })
describe('Office Desk core flow', () => {
  it('loads the home screen and opens countdown creation', async () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /A little more in focus/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Add your first countdown/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
