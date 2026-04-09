import React, { createContext, useContext, useState } from "react"

interface AppContextValue {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (v: boolean) => void
  currentEnvironment: string
  setCurrentEnvironment: (v: string) => void
  notificationsOpen: boolean
  setNotificationsOpen: (v: boolean) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export const ENVIRONMENTS = ["Production", "Staging", "Development", "QA"]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [currentEnvironment, setCurrentEnvironment] = useState("Production")
  const [notificationsOpen, setNotificationsOpen] = useState(false)

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
