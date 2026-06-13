import * as React from "react"

/**
 * Lightweight devtools state for the mockup. Held in a tiny React context
 * outside the mock data store so toggling these flags never mutates seed data.
 *
 * - `simulateError`: when true, route components render an error Card with a
 *   Retry button instead of their normal content.
 */
type DevtoolsState = {
  simulateError: boolean
  setSimulateError: (v: boolean) => void
  commandOpen: boolean
  setCommandOpen: (v: boolean) => void
}

const DevtoolsContext = React.createContext<DevtoolsState | null>(null)

export function DevtoolsProvider({ children }: { children: React.ReactNode }) {
  const [simulateError, setSimulateError] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)

  // Global cmd+k / ctrl+k binding for the command palette.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCommandOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const value = React.useMemo(
    () => ({ simulateError, setSimulateError, commandOpen, setCommandOpen }),
    [simulateError, commandOpen],
  )

  return (
    <DevtoolsContext.Provider value={value}>
      {children}
    </DevtoolsContext.Provider>
  )
}

export function useDevtools(): DevtoolsState {
  const ctx = React.useContext(DevtoolsContext)
  if (!ctx) {
    // Safe fallback for tests or storybook contexts that skip the provider.
    return {
      simulateError: false,
      setSimulateError: () => {},
      commandOpen: false,
      setCommandOpen: () => {},
    }
  }
  return ctx
}
