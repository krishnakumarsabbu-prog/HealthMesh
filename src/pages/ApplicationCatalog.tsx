import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Server, ArrowUpRight, Plus, SlidersHorizontal, Grid3x3, List } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const APPS = [
  { name: "payments-api", team: "Payments", env: "Production", status: "healthy" as const, uptime: "99.98%", latency: "42ms", rpm: "12.4K", type: "API", tags: ["critical", "pci"] },
  { name: "auth-service", team: "Platform", env: "Production", status: "warning" as const, uptime: "99.82%", latency: "87ms", rpm: "34.1K", type: "Service", tags: ["critical"] },
  { name: "catalog-service", team: "Commerce", env: "Production", status: "healthy" as const, uptime: "99.99%", latency: "31ms", rpm: "8.7K", type: "API", tags: ["core"] },
  { name: "recommendation-engine", team: "ML", env: "Production", status: "degraded" as const, uptime: "98.41%", latency: "234ms", rpm: "2.1K", type: "ML Service", tags: ["ai"] },
  { name: "notification-worker", team: "Platform", env: "Production", status: "healthy" as const, uptime: "99.95%", latency: "18ms", rpm: "5.6K", type: "Worker", tags: ["async"] },
  { name: "search-api", team: "Discovery", env: "Production", status: "critical" as const, uptime: "96.20%", latency: "2140ms", rpm: "6.3K", type: "API", tags: ["critical"] },
  { name: "inventory-service", team: "Commerce", env: "Production", status: "healthy" as const, uptime: "99.97%", latency: "55ms", rpm: "3.2K", type: "Service", tags: ["core"] },
  { name: "shipping-calculator", team: "Logistics", env: "Production", status: "healthy" as const, uptime: "99.94%", latency: "67ms", rpm: "1.8K", type: "Service", tags: [] },
  { name: "fraud-detection", team: "Risk", env: "Production", status: "healthy" as const, uptime: "99.99%", latency: "28ms", rpm: "11.2K", type: "ML Service", tags: ["critical", "ai"] },
  { name: "reporting-service", team: "Analytics", env: "Production", status: "healthy" as const, uptime: "99.87%", latency: "145ms", rpm: "420", type: "Service", tags: [] },
  { name: "media-processor", team: "Content", env: "Production", status: "healthy" as const, uptime: "99.91%", latency: "380ms", rpm: "890", type: "Worker", tags: ["async"] },
  { name: "webhook-gateway", team: "Platform", env: "Production", status: "healthy" as const, uptime: "99.96%", latency: "22ms", rpm: "7.4K", type: "Gateway", tags: ["core"] },
]

export function ApplicationCatalog() {
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"grid" | "list">("list")
  const [filter, setFilter] = useState<string>("all")

  const filtered = APPS.filter(app => {
    const matchSearch = app.name.includes(search) || app.team.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" || app.status === filter
    return matchSearch && matchFilter
  })

  const statusCounts = {
    all: APPS.length,
    healthy: APPS.filter(a => a.status === "healthy").length,
    warning: APPS.filter(a => a.status === "warning").length,
    critical: APPS.filter(a => a.status === "critical").length,
    degraded: APPS.filter(a => a.status === "degraded").length,
  }

  return (
    <div className="min-h-full">
      <PageHeader
        title="Application Catalog"
        description={`${APPS.length} applications monitored across all environments`}
        actions={
          <Button size="sm" className="gap-2">
            <Plus className="w-3.5 h-3.5" /> Add Application
          </Button>
        }
      />

      <div className="px-6 pb-6 space-y-4">
        {/* Filters bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search applications..."
              className="pl-9 h-8 text-sm"
            />
          </div>

          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {(["all", "healthy", "warning", "critical", "degraded"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all duration-150 capitalize",
                  filter === f
                    ? "bg-background text-foreground shadow-elevation-1"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f} ({statusCounts[f]})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <Button variant={view === "list" ? "secondary" : "ghost"} size="icon-sm" onClick={() => setView("list")}>
              <List className="w-4 h-4" />
            </Button>
            <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon-sm" onClick={() => setView("grid")}>
              <Grid3x3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Apps */}
        {view === "list" ? (
          <div className="premium-card overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-border/60 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Application</span>
              <span>Status</span>
              <span>Latency</span>
              <span>Uptime</span>
              <span>RPM</span>
              <span></span>
            </div>
            <div className="divide-y divide-border/40">
              {filtered.map((app, i) => (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-muted/30 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
                      <Server className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold font-mono text-foreground truncate">{app.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-muted-foreground">{app.team}</span>
                        {app.tags.map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0 rounded-full bg-muted text-muted-foreground font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={app.status} size="sm" />
                  <div className={cn(
                    "text-sm font-mono font-semibold",
                    parseInt(app.latency) > 500 ? "text-red-500" :
                    parseInt(app.latency) > 200 ? "text-amber-500" : "text-foreground"
                  )}>{app.latency}</div>
                  <div className="text-sm font-mono text-foreground">{app.uptime}</div>
                  <div className="text-sm font-mono text-foreground">{app.rpm}</div>
                  <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((app, i) => (
              <motion.div
                key={app.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2 }}
                className="premium-card p-4 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                    <Server className="w-4 h-4 text-primary" />
                  </div>
                  <StatusBadge status={app.status} size="sm" />
                </div>
                <div className="font-semibold text-sm font-mono text-foreground mb-0.5 truncate">{app.name}</div>
                <div className="text-xs text-muted-foreground mb-3">{app.team} · {app.type}</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs font-mono font-semibold text-foreground">{app.latency}</div>
                    <div className="text-[10px] text-muted-foreground">p99</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono font-semibold text-foreground">{app.uptime}</div>
                    <div className="text-[10px] text-muted-foreground">uptime</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono font-semibold text-foreground">{app.rpm}</div>
                    <div className="text-[10px] text-muted-foreground">rpm</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
