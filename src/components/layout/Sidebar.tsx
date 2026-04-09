import { NavLink, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, AppWindow, Layers, Plug2, TriangleAlert as AlertTriangle, GitBranch, Sparkles, ShieldCheck, Wand as Wand2, TrendingUp, Users, Settings, ChevronLeft, ChevronRight, Activity, Wrench, Target, FileText, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const NAV_SECTIONS = [
  {
    label: "Intelligence",
    items: [
      { icon: LayoutDashboard, label: "Executive Overview", path: "/", description: "Portfolio health at a glance" },
      { icon: AppWindow, label: "Application Catalog", path: "/catalog", description: "All monitored applications" },
      { icon: Layers, label: "Application 360", path: "/app360", description: "Deep-dive per application" },
    ]
  },
  {
    label: "Operations",
    items: [
      { icon: Plug2, label: "Connector Hub", path: "/connectors", description: "Data source integrations" },
      { icon: AlertTriangle, label: "Incidents & Alerts", path: "/incidents", description: "Active issues & history" },
      { icon: GitBranch, label: "Dependency Map", path: "/dependencies", description: "Service topology & flows" },
    ]
  },
  {
    label: "AI & Analytics",
    items: [
      { icon: Sparkles, label: "AI Insights", path: "/ai-insights", description: "ML-powered intelligence" },
      { icon: TrendingUp, label: "Historical Trends", path: "/trends", description: "Long-term performance data" },
      { icon: ShieldCheck, label: "Health Rules", path: "/health-rules", description: "Thresholds & policies" },
    ]
  },
  {
    label: "Platform",
    items: [
      { icon: Wand2, label: "Onboarding Studio", path: "/onboarding", description: "Connect new applications" },
      { icon: Users, label: "Teams & Ownership", path: "/teams", description: "People & responsibilities" },
      { icon: Settings, label: "Settings & Admin", path: "/settings", description: "Configuration & access" },
    ]
  },
  {
    label: "Governance",
    items: [
      { icon: Wrench, label: "Maintenance Windows", path: "/maintenance", description: "Scheduled downtime windows" },
      { icon: Target, label: "SLA / SLO Settings", path: "/sla", description: "Objectives & error budgets" },
      { icon: FileText, label: "Audit Logs", path: "/audit", description: "Activity & change history" },
      { icon: Shield, label: "Roles & Permissions", path: "/roles", description: "Access control & user roles" },
      { icon: Activity, label: "System Status", path: "/system-status", description: "Platform health & uptime" },
    ]
  }
]

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp()
  const location = useLocation()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] shrink-0 overflow-hidden"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 border-b border-[hsl(var(--sidebar-border))] px-4 shrink-0",
          sidebarCollapsed ? "justify-center" : "gap-3"
        )}>
          <div className="relative shrink-0">
            <img
              src="/HealthMesh__connected_health_innovation.png"
              alt="HealthMesh"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[hsl(var(--sidebar-bg))] shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <div className="font-bold text-sm text-foreground tracking-tight leading-none">HealthMesh</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-none truncate">Unified Health Intelligence</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className="px-2 space-y-0">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="mb-4">
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-3 mb-1.5"
                    >
                      <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                        {section.label}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {section.items.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path))
                  const Icon = item.icon

                  if (sidebarCollapsed) {
                    return (
                      <Tooltip key={item.path} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <NavLink
                            to={item.path}
                            className={cn(
                              "flex items-center justify-center w-10 h-10 rounded-lg mx-auto mb-0.5 transition-all duration-150",
                              isActive
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/8"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </NavLink>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group relative",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/8 font-medium"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-lg bg-primary/10"
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        />
                      )}
                      <Icon className={cn("w-4 h-4 shrink-0 relative z-10", isActive && "text-primary")} />
                      <span className="truncate relative z-10">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1 h-4 rounded-full bg-primary relative z-10" />
                      )}
                    </NavLink>
                  )
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* System status bar */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-3 border-t border-[hsl(var(--sidebar-border))]"
            >
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All Systems Operational</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "absolute -right-3 top-20 w-6 h-6 rounded-full bg-background border border-border shadow-elevation-1",
            "flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30",
            "transition-all duration-150 z-50"
          )}
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-3 h-3" />
            : <ChevronLeft className="w-3 h-3" />
          }
        </button>
      </div>
    </motion.aside>
  )
}
