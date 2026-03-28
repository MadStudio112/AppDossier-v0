import { act, render, screen, waitFor } from '@testing-library/react'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { createAppRouter } from '@/app/router'

async function renderRoute(path: string) {
  const history = createMemoryHistory({ initialEntries: [path] })
  const router = createAppRouter(history)

  let utils
  await act(async () => {
    await router.load()
    utils = render(<RouterProvider router={router} />)
  })

  return utils
}

describe('router rendering', () => {
  it('renders the home route from the registry', async () => {
    await renderRoute('/')
    expect(screen.getAllByText('TEAMCHEF').length).toBeGreaterThan(0)
    expect(screen.getByText('Product Requirements Document')).toBeInTheDocument()
  })

  it('renders a document route for a flat slug', async () => {
    await renderRoute('/prd')
    expect(screen.getByText('Was ist TEAMCHEF?')).toBeInTheDocument()
    expect(screen.getByText('Produktziele')).toBeInTheDocument()
  })

  it('renders the not found state for an unknown slug', async () => {
    await renderRoute('/missing')
    await waitFor(() => {
      expect(screen.getByText(/Die angeforderte Dossier-Seite existiert nicht/)).toBeInTheDocument()
    })
  })
})
