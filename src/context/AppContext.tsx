import React, { createContext, useContext, useState, useEffect } from "react"
import { listEnvironments, type Environment } from "@/lib/api/dynamic"

interface AppContextValue {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (v: boolean) => void
  currentEnvironment: string
  setCurrentEnvironment: (v: string) => void
  notificationsOpen: boolean
  setNotificationsOpen: (v: boolean) => void
  environments: Environment[]
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

const FALLBACK_ENVIRONMENTS: Environment[] = [
  { id: "1", name: "Production", color_class: "bg-emerald-500", display_order: 1 },
  { id: "2", name: "Staging", color_class: "bg-amber-500", display_order: 2 },
  { id: "3", name: "Development", color_class: "bg-blue-500", display_order: 3 },
  { id: "4", name: "QA", color_class: "bg-blue-500", display_order: 4 },
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [currentEnvironment, setCurrentEnvironment] = useState("Production")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [environments, setEnvironments] = useState<Environment[]>(FALLBACK_ENVIRONMENTS)

  useEffect(() => {
    listEnvironments()
      .then(setEnvironments)
      .catch(() => setEnvironments(FALLBACK_ENVIRONMENTS))
  }, [])

  return (
    <AppContext.Provider value={{
      sidebarCollapsed,
      setSidebarCollapsed,
      commandPaletteOpen,
      setCommandPaletteOpen,
      currentEnvironment,
      setCurrentEnvironment,
      notificationsOpen,
      setNotificationsOpen,
      environments,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
