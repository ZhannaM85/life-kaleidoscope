import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from './AppShell'
import { NotFoundPage } from './NotFoundPage'

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <p>Today content</p> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
    { initialEntries: [path] }
  )
  return render(<RouterProvider router={router} />)
}

describe('NotFoundPage', () => {
  it('renders inside the app shell for an unknown route', () => {
    renderAt('/nonsense-route')
    expect(screen.getByText('Life Like Kaleidoscope')).toBeInTheDocument()
    expect(screen.getByText("There's no page here")).toBeInTheDocument()
  })

  it('links back to the Today screen', () => {
    renderAt('/nonsense-route')
    expect(screen.getByRole('link', { name: /back to today/i })).toHaveAttribute('href', '/')
  })

  it('does not hijack known routes', () => {
    renderAt('/')
    expect(screen.getByText('Today content')).toBeInTheDocument()
    expect(screen.queryByText("There's no page here")).not.toBeInTheDocument()
  })
})
