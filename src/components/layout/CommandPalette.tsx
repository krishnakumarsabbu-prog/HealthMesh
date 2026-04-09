import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Search, LayoutDashboard, AppWindow, Layers, Plug2, TriangleAlert as AlertTriangle, GitBranch, Sparkles, TrendingUp, ShieldCheck, Wand as Wand2, Users, Settings, ArrowRight, Hash, Command } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"

const COMMANDS = [
  { icon: LayoutDashboard, label: "Executive Overview", path: "/", category: "Navigation" },
  { icon: AppWindow, label: "Application Catalog", path: "/catalog", category: "Navigation" },
  { icon: Layers, label: "Application 360", path: "/app360", category: "Navigation" },
  { icon: Plug2, label: "Connector Hub", path: "/connectors", category: "Navigation" },
  { icon: AlertTriangle, label: "Incidents & Alerts", path: "/incidents", category: "Navigation" },
  { icon: GitBranch, label: "Dependency Map", path: "/dependencies", category: "Navigation" },
  { icon: Sparkles, label: "AI Insights", path: "/ai-insights", category: "Navigation" },
  { icon: TrendingUp, label: "Historical Trends", path: "/trends", category: "Navigation" },
  { icon: ShieldCheck, label: "Health Rules", path: "/health-rules", category: "Navigation" },
  { icon: Wand2, label: "Onboarding Studio", path: "/onboarding", category: "Navigation" },
  { icon: Users, label: "Teams & Ownership", path: "/teams", category: "Navigation" },
  { icon: Settings, label: "Settings & Admin", path: "/settings", category: "Navigation" },
]

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useApp()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()

  const filtered = query
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      if (e.key === "Escape") setCommandPaletteOpen(false)
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setCommandPaletteOpen])

  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery("")
      setSelected(0)
    }
  }, [commandPaletteOpen])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelected(s => Math.min(s + 1, filtered.length - 1))
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelected(s => Math.max(s - 1, 0))
      }
      if (e.key === "Enter" && filtered[selected]) {
        navigate(filtered[selected].path)
        setCommandPaletteOpen(false)
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [commandPaletteOpen, filtered, selected, navigate, setCommandPaletteOpen])

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-card border border-border/60 rounded-2xl shadow-premium overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelected(0) }}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  placeholder="Search pages, applications, actions..."
                />
                <div className="flex items-center gap-1">
                  <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border rounded">ESC</kbd>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No results for "{query}"
                  </div>
                ) : (
                  <>
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                      Navigation
                    </div>
                    {filtered.map((cmd, idx) => {
                      const Icon = cmd.icon
                      return (
                        <button
                          key={cmd.path}
                          onClick={() => { navigate(cmd.path); setCommandPaletteOpen(false) }}
                          onMouseEnter={() => setSelected(idx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                            idx === selected
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted/60"
                          )}
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                            idx === selected ? "bg-primary/15" : "bg-muted"
                          )}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="flex-1 text-left font-medium">{cmd.label}</span>
                          {idx === selected && <ArrowRight className="w-3.5 h-3.5 opacity-60" />}
                        </button>
                      )
                    })}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border/60 bg-muted/30">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <kbd className="px-1 py-0.5 border border-border rounded text-[9px] font-mono">↑↓</kbd>
                  navigate
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <kbd className="px-1 py-0.5 border border-border rounded text-[9px] font-mono">↵</kbd>
                  select
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <kbd className="px-1 py-0.5 border border-border rounded text-[9px] font-mono">ESC</kbd>
                  close
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
