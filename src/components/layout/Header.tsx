import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bell, ChevronRight, Command, Sun, Moon, User, Settings, LogOut, ChevronDown, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, TriangleAlert as AlertTriangle, Zap, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"
import { useApp, ENVIRONMENTS } from "@/context/AppContext"
import { useAuth } from "@/context/AuthContext"
import { getRoleLabel, getRoleBadgeColor } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

const PAGE_META: Record<string, { label: string; parent?: string }> = {
  "/": { label: "Executive Overview" },
  "/catalog": { label: "Application Catalog", parent: "Intelligence" },
  "/app360": { label: "Application 360", parent: "Intelligence" },
  "/connectors": { label: "Connector Hub", parent: "Operations" },
  "/incidents": { label: "Incidents & Alerts", parent: "Operations" },
  "/dependencies": { label: "Dependency Map", parent: "Operations" },
  "/ai-insights": { label: "AI Insights", parent: "AI & Analytics" },
  "/trends": { label: "Historical Trends", parent: "AI & Analytics" },
  "/health-rules": { label: "Health Rules", parent: "AI & Analytics" },
  "/onboarding": { label: "Onboarding Studio", parent: "Platform" },
  "/teams": { label: "Teams & Ownership", parent: "Platform" },
  "/settings": { label: "Settings & Admin", parent: "Platform" },
}

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "critical", title: "payments-api latency spike", desc: "P99 > 2000ms for 5 minutes", time: "2m ago" },
  { id: 2, type: "warning", title: "auth-service memory warning", desc: "Memory at 87% capacity", time: "8m ago" },
  { id: 3, type: "healthy", title: "database-primary recovered", desc: "Incident resolved automatically", time: "15m ago" },
  { id: 4, type: "info", title: "Scheduled maintenance", desc: "Tonight 2–4am UTC", time: "1h ago" },
]

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { currentEnvironment, setCurrentEnvironment, setCommandPaletteOpen, notificationsOpen, setNotificationsOpen } = useApp()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchFocused, setSearchFocused] = useState(false)

  const pageMeta = PAGE_META[location.pathname] || { label: "Dashboard" }

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U"
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.type !== "healthy").length

  const notifIcon = (type: string) => {
    switch (type) {
      case "critical": return <AlertCircle className="w-3.5 h-3.5 text-red-500" />
      case "warning": return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
      case "healthy": return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      default: return <Zap className="w-3.5 h-3.5 text-blue-500" />
    }
  }

  return (
    <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-xl flex items-center gap-4 px-6 sticky top-0 z-30">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-sm min-w-0">
        {pageMeta.parent && (
          <>
            <span className="text-muted-foreground/60 font-medium hidden sm:block">{pageMeta.parent}</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 hidden sm:block" />
          </>
        )}
        <span className="font-semibold text-foreground truncate">{pageMeta.label}</span>
      </div>

      <div className="flex-1" />

      {/* Search bar */}
      <div className="relative hidden md:block">
        <motion.div
          animate={{ width: searchFocused ? 280 : 220 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "flex items-center gap-2 h-8 rounded-lg border transition-all duration-200",
            "bg-muted/50 px-3",
            searchFocused
              ? "border-primary/40 bg-background shadow-sm ring-2 ring-primary/10"
              : "border-border/60 hover:border-border"
          )}
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            className="bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/70 w-full"
            placeholder="Search applications, incidents..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="shrink-0">
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/60 bg-muted border border-border/60 rounded">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </div>
        </motion.div>
      </div>

      {/* Environment selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs font-medium hidden sm:flex">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              currentEnvironment === "Production" ? "bg-emerald-500" :
              currentEnvironment === "Staging" ? "bg-amber-500" :
              "bg-blue-500"
            )} />
            {currentEnvironment}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Environment</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ENVIRONMENTS.map(env => (
            <DropdownMenuItem key={env} onClick={() => setCurrentEnvironment(env)} className="gap-2">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                env === "Production" ? "bg-emerald-500" :
                env === "Staging" ? "bg-amber-500" :
                "bg-blue-500"
              )} />
              {env}
              {env === currentEnvironment && <CheckCircle2 className="w-3.5 h-3.5 text-primary ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Command palette shortcut */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="hidden md:flex"
        onClick={() => setCommandPaletteOpen(true)}
        title="Command Palette (⌘K)"
      >
        <Command className="w-4 h-4" />
      </Button>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggleTheme}
        title={`Switch to ${theme === "ivory" ? "Green" : "Ivory"} theme`}
        className="relative"
      >
        <AnimatePresence mode="wait">
          {theme === "ivory" ? (
            <motion.div key="moon" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
              <Moon className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div key="sun" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }} transition={{ duration: 0.15 }}>
              <Sun className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Notifications */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Button>

        <AnimatePresence>
          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-9 w-80 z-50 bg-popover border border-border/60 rounded-xl shadow-premium overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                  <span className="font-semibold text-sm">Notifications</span>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">{unreadCount} new</span>
                </div>
                <div className="divide-y divide-border/40 max-h-72 overflow-y-auto">
                  {MOCK_NOTIFICATIONS.map(n => (
                    <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors">
                      <div className="mt-0.5">{notifIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{n.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{n.desc}</div>
                      </div>
                      <span className="text-[10px] text-muted-foreground/70 shrink-0 mt-0.5">{n.time}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-border/60">
                  <button className="text-xs text-primary font-medium hover:underline">View all notifications</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Profile menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-xl p-1 pl-2 hover:bg-accent/8 transition-all duration-150 group">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-semibold text-foreground leading-none">{user?.name ?? "User"}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {user ? getRoleLabel(user.role_id) : ""}
              </div>
            </div>
            <Avatar className="w-7 h-7">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-foreground text-sm">{user?.name}</span>
              <span className="text-[11px] text-muted-foreground truncate">{user?.email}</span>
              {user && (
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded w-fit mt-0.5", getRoleBadgeColor(user.role_id))}>
                  {getRoleLabel(user.role_id)}
                </span>
              )}
            </div>
          </DropdownMenuLabel>
          {user && (user.lob_name || user.team_name) && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                {user.lob_name && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-0.5">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{user.lob_name}</span>
                  </div>
                )}
                {user.team_name && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-0.5">
                    <User className="w-3 h-3 shrink-0" />
                    <span className="truncate">{user.team_name}</span>
                  </div>
                )}
                {user.project_name && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Settings className="w-3 h-3 shrink-0" />
                    <span className="truncate">{user.project_name}</span>
                  </div>
                )}
              </div>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2">
            <User className="w-3.5 h-3.5" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Settings className="w-3.5 h-3.5" /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-500 focus:text-red-500">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
