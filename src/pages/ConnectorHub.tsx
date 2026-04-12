import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Plus, Search, LayoutGrid, List, X, Activity, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, CircleX, Plug, Building2, Info } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import { CONNECTOR_INSTANCES as STATIC_INSTANCES, CATEGORIES, type ConnectorInstance, type ConnectorCategory } from "./connectorHub/data"
import { ConnectorCard } from "./connectorHub/ConnectorCard"
import { ConnectorDrawer } from "./connectorHub/ConnectorDrawer"
import { AddConnectorWizard } from "./connectorHub/AddConnectorWizard"
import { useApi } from "@/hooks/useApi"
import { listConnectorInstances } from "@/lib/api/connectors"
import { mapConnectorInstance } from "@/lib/mappers"
import { useAuth } from "@/context/AuthContext"

const CONNECTOR_LIMIT = 25

function apiToConnector(a: Parameters<typeof mapConnectorInstance>[0]): ConnectorInstance {
  const m = mapConnectorInstance(a)
  return {
    id: m.id,
    name: m.name,
    template: m.templateId,
    category: m.category as ConnectorCategory,
    status: m.status as ConnectorInstance["status"],
    environment: m.environment,
    version: m.version,
    lastSync: m.lastSync,
    healthScore: m.healthScore,
    usageCount: m.usageCount,
    appsConnected: m.appsConnected,
    capabilities: m.capabilities,
    description: m.description,
    bgColor: m.bgColor,
    iconBg: m.iconBg,
    abbr: m.abbr,
  }
}

const ALL = "All"
type CategoryFilter = typeof ALL | ConnectorCategory
const STATUS_FILTERS = [ALL, "active", "warning", "error"] as const

export function ConnectorHub() {
  const { user } = useAuth()
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(ALL)
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]>(ALL)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedConnector, setSelectedConnector] = useState<ConnectorInstance | null>(null)
  const [showAddWizard, setShowAddWizard] = useState(false)

  const { data: apiInstances } = useApi(listConnectorInstances)
  const CONNECTOR_INSTANCES = apiInstances && apiInstances.length > 0
    ? apiInstances.map(apiToConnector)
    : STATIC_INSTANCES

  const filtered = CONNECTOR_INSTANCES.filter(c => {
    if (categoryFilter !== ALL && c.category !== categoryFilter) return false
    if (statusFilter !== ALL && c.status !== statusFilter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.template.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    total: CONNECTOR_INSTANCES.length,
    active: CONNECTOR_INSTANCES.filter(c => c.status === "active").length,
    warning: CONNECTOR_INSTANCES.filter(c => c.status === "warning").length,
    error: CONNECTOR_INSTANCES.filter(c => c.status === "error").length,
    totalApps: CONNECTOR_INSTANCES.reduce((s, c) => s + c.appsConnected, 0),
  }

  return (
    <div className="min-h-full">
      <PageHeader
        title="Connector Hub"
        description="Manage integrations, data sources, and app bindings across your observability stack"
        badge={<Badge variant="healthy" size="sm">{stats.active} Active</Badge>}
        actions={
          <PermissionGuard action="manage_connectors">
            <Button size="sm" className="gap-2" onClick={() => setShowAddWizard(true)}>
              <Plus className="w-3.5 h-3.5" /> Add Connector
            </Button>
          </PermissionGuard>
        }
      />

      <div className="px-6 pb-6 space-y-5">
        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Connectors", value: stats.total, icon: <Plug className="w-4 h-4 text-muted-foreground" />, color: "text-foreground" },
            { label: "Active", value: stats.active, icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, color: "text-emerald-500" },
            { label: "Warning", value: stats.warning, icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, color: "text-amber-500" },
            { label: "Error", value: stats.error, icon: <CircleX className="w-4 h-4 text-red-500" />, color: "text-red-500" },
            { label: "Apps Instrumented", value: stats.totalApps, icon: <Activity className="w-4 h-4 text-primary" />, color: "text-primary" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="premium-card p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">{s.icon}</div>
              <div>
                <div className={cn("text-xl font-bold leading-tight", s.color)}>{s.value}</div>
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connector limit indicator */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-muted/20">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Plug className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Connector Capacity</span>
                {user?.lob_name && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 border border-primary/15">
                    <Building2 className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-medium text-primary">{user.lob_name}</span>
                  </div>
                )}
              </div>
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                <span className={cn("font-bold", stats.total >= CONNECTOR_LIMIT * 0.9 ? "text-amber-500" : "text-foreground")}>{stats.total}</span>
                /{CONNECTOR_LIMIT}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-border/60 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.total / CONNECTOR_LIMIT) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn("h-full rounded-full",
                  stats.total >= CONNECTOR_LIMIT ? "bg-red-500" :
                  stats.total >= CONNECTOR_LIMIT * 0.9 ? "bg-amber-500" : "bg-primary"
                )}
              />
            </div>
          </div>
          {stats.total >= CONNECTOR_LIMIT * 0.8 && (
            <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-medium shrink-0">
              <Info className="w-3.5 h-3.5" />
              {stats.total >= CONNECTOR_LIMIT ? "Limit reached" : `${CONNECTOR_LIMIT - stats.total} slots left`}
            </div>
          )}
        </div>

        {/* Filter + Search bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-1 min-w-0">
            {([ALL, ...CATEGORIES] as (typeof ALL | ConnectorCategory)[]).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-medium rounded-full whitespace-nowrap transition-all duration-150 border shrink-0",
                  categoryFilter === cat
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {STATUS_FILTERS.map(sf => (
              <button
                key={sf}
                onClick={() => setStatusFilter(sf)}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-medium rounded-full whitespace-nowrap transition-all duration-150 border capitalize",
                  statusFilter === sf
                    ? "bg-foreground/8 text-foreground border-foreground/20"
                    : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {sf}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search connectors…" className="pl-8 h-8 text-xs w-44" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          <div className="flex items-center border border-border/60 rounded-lg overflow-hidden shrink-0">
            <button onClick={() => setViewMode("grid")} className={cn("p-1.5 transition-colors", viewMode === "grid" ? "bg-muted/60 text-foreground" : "text-muted-foreground hover:text-foreground")}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode("list")} className={cn("p-1.5 transition-colors", viewMode === "list" ? "bg-muted/60 text-foreground" : "text-muted-foreground hover:text-foreground")}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {stats.total} connectors
        </div>

        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((c, i) => (
                <ConnectorCard key={c.id} connector={c} onSelect={setSelectedConnector} index={i} />
              ))}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -2 }}
                onClick={() => setShowAddWizard(true)}
                className="rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/3 p-4 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center min-h-[220px] group"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/60 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Add Connector</div>
                <div className="text-[11px] text-muted-foreground/60 group-hover:text-muted-foreground transition-colors max-w-[120px]">Connect any data source to HealthMesh</div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="premium-card overflow-hidden">
              <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-2.5 border-b border-border/60 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span></span>
                <span>Connector</span>
                <span>Category</span>
                <span>Environment</span>
                <span>Managed By</span>
                <span>Health</span>
                <span>Apps</span>
                <span>Last Sync</span>
              </div>
              <div className="divide-y divide-border/40">
                {filtered.map((c, i) => {
                  const statusDot = c.status === "active" ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" :
                    c.status === "warning" ? "bg-amber-500" : c.status === "error" ? "bg-red-500" : "bg-slate-400"
                  return (
                    <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedConnector(c)}
                      className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 items-center px-5 py-3 hover:bg-muted/20 transition-colors cursor-pointer">
                      <div className={cn("w-2 h-2 rounded-full shrink-0", statusDot)} />
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono shrink-0", c.iconBg)}>
                          {c.abbr}
                        </div>
                        <span className="text-sm font-semibold text-foreground truncate">{c.name}</span>
                      </div>
                      <Badge variant="secondary" size="sm">{c.category}</Badge>
                      <span className="text-xs text-muted-foreground">{c.environment}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {c.managedBy ? (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 shrink-0" />
                            {c.managedBy}
                          </span>
                        ) : "—"}
                      </span>
                      <span className={cn("text-xs font-bold font-mono",
                        c.healthScore >= 90 ? "text-emerald-500" : c.healthScore >= 70 ? "text-amber-500" : "text-red-500"
                      )}>{c.healthScore > 0 ? `${c.healthScore}%` : "—"}</span>
                      <span className="text-xs text-foreground">{c.appsConnected}</span>
                      <span className="text-xs text-muted-foreground">{c.lastSync}</span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConnectorDrawer
        connector={selectedConnector}
        onClose={() => setSelectedConnector(null)}
        onEdit={() => { setSelectedConnector(null); setShowAddWizard(true) }}
      />

      <AnimatePresence>
        {showAddWizard && (
          <AddConnectorWizard onClose={() => setShowAddWizard(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
