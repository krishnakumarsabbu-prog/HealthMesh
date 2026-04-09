import React, { createContext, useContext, useState, useEffect } from "react"

type Theme = "ivory" | "green"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("healthmesh-theme")
    return (stored as Theme) || "ivory"
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === "green") {
      root.classList.add("dark")
      root.setAttribute("data-theme", "green")
    } else {
      root.classList.remove("dark")
      root.setAttribute("data-theme", "ivory")
    }
    localStorage.setItem("healthmesh-theme", theme)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)
  const toggleTheme = () => setThemeState(prev => prev === "ivory" ? "green" : "ivory")

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
