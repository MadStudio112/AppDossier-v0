import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { HelmetProvider } from 'react-helmet-async'
import { router } from '@/app/router'
import { registryError } from '@/content/registry'
import { AccessGate } from '@/components/guards/AccessGate'
import '@/styles/app.css'

const SESSION_KEY = 'app_unlocked'
const ACCESS_CODE = (import.meta.env.VITE_ACCESS_CODE ?? '1234').trim()

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) }
  }

  render() {
    const err = registryError ?? this.state.error
    if (err) {
      return (
        <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
          <h1>Fehler beim Laden der Inhalte</h1>
          <p>{err}</p>
        </main>
      )
    }
    return this.props.children
  }
}

function App() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1'
  )

  if (!unlocked) {
    return (
      <AccessGate
        validateCode={code => code === ACCESS_CODE}
        onSuccess={() => {
          sessionStorage.setItem(SESSION_KEY, '1')
          setUnlocked(true)
        }}
      />
    )
  }

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </ErrorBoundary>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
