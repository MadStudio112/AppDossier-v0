import { Outlet, createRootRoute, createRoute, createRouter, type RouterHistory } from '@tanstack/react-router'
import { DocumentRoutePage, HomeRoutePage, NotFoundRoutePage } from '@/app/pages'
import { getDocumentBySlug } from '@/content/registry'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeRoutePage,
})

const documentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$slug',
  loader: ({ params }) => getDocumentBySlug(params.slug),
  component: () => {
    const page = documentRoute.useLoaderData()
    return page ? <DocumentRoutePage page={page} /> : <NotFoundRoutePage />
  },
  errorComponent: () => <NotFoundRoutePage />,
})

const routeTree = rootRoute.addChildren([homeRoute, documentRoute])

export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree, defaultPreload: 'intent', history })
}

export const router = createAppRouter()

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
