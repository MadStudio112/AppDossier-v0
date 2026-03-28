import { act, render, screen } from '@testing-library/react'
import { useScrollSpy } from '@/hooks/use-scrollspy'

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}

function Probe() {
  const active = useScrollSpy(['one', 'two'])
  return <div data-testid="active-id">{active}</div>
}

describe('useScrollSpy', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = []
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver as unknown as typeof IntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('updates the active id when an observed section intersects', () => {
    render(
      <>
        <section id="one" />
        <section id="two" />
        <Probe />
      </>,
    )

    expect(screen.getByTestId('active-id')).toHaveTextContent('one')

    act(() => {
      const target = document.getElementById('two') as Element
      MockIntersectionObserver.instances[0].callback([{ isIntersecting: true, target } as IntersectionObserverEntry], {} as IntersectionObserver)
    })

    expect(screen.getByTestId('active-id')).toHaveTextContent('two')
  })
})
