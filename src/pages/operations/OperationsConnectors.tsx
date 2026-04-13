import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, RefreshCw, ChevronDown, ChevronUp, Plug2, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, CircleX } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ConnectorInstanceRow } from "@/lib/api/connectors"

interface Props {
  connectors: ConnectorInstanceRow[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  refreshing: boolean
}

const STATUS_FILTERS = ["All", "active", "warning", "error"] as const
type StatusFilter = typeof STATUS_FILTERS[number]

const statusConfig = {
  active: { label: "Active", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500" },
  warning: { label: "Warning", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-500" },
  error: { label: "Error", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-500" },
  inactive: { label: "Inactive", color: "text-muted-foreground", bg: "bg-muted border-border", dot: "bg-muted-foreground" },
}

function StatusIcon({ status }: { status: string }) {
  if (status === "active") return <CheckCircle className="w-4 h-4 text-emerald-500" />
  if (status === "warning") return <AlertTriangle className="w-4 h-4 text-amber-500" />
  return <CircleX className="w-4 h-4 text-red-500" />
}

function ConnectorRow({ connector }: { connector: ConnectorInstanceRow }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = statusConfig[connector.status as keyof typeof statusConfig] ?? statusConfig.inactive

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-accent/5 transition-colors text-left"
      >
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0", connector.icon_bg || "bg-slate-100 dark:bg-slate-800")}>
          <span className="text-foreground">{connector.abbr || connector.name.slice(0, 2).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">{connector.name}</span>
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0", cfg.bg, cfg.color)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-muted-foreground">{connector.category}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{connector.environment}</span>
            {connector.apps_connected > 0 && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{connector.apps_connected} apps</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-foreground">{connector.health_score}%</div>
            <div className="text-[10px] text-muted-foreground">health</div>
          </div>
          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
            <div
              className={cn("h-full rounded-full transition-all", connector.health_score >= 80 ? "bg-emerald-500" : connector.health_score >= 60 ? "bg-amber-500" : "bg-red-500")}
              style={{ width: `${connector.health_score}%` }}
            />
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 border-t border-border bg-muted/20 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground mb-1">Version</div>
                <div className="font-medium text-foreground">{connector.version || "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Last Sync</div>
                <div className="font-medium text-foreground">{connector.last_sync || "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Usage Count</div>
                <div className="font-medium text-foreground">{connector.usage_count}</div>
              </div>
              {connector.description && (
                <div className="col-span-2 sm:col-span-3">
                  <div className="text-muted-foreground mb-1">Description</div>
                  <div className="text-foreground">{connector.description}</div>
                </div>
              )}
              {connector.capabilities && connector.capabilities.length > 0 && (
                <div className="col-span-2 sm:col-span-3">
                  <div className="text-muted-foreground mb-1">Capabilities</div>
                  <div className="flex flex-wrap gap-1">
                    {connector.capabilities.map(cap => (
                      <Badge key={cap} variant="secondary" className="text-[10px] h-5">{cap}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function OperationsConnectors({ connectors, loading, error, onRefresh, refreshing }: Props) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")

  const filtered = connectors.filter(c => {
    if (statusFilter !== "All" && c.status !== statusFilter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.category.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    active: connectors.filter(c => c.status === "active").length,
    warning: connectors.filter(c => c.status === "warning").length,
    error: connectors.filter(c => c.status === "error").length,
  }

  return (
    <div className="space-y-4 px-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search connectors..."
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border font-medium transition-all",
                statusFilter === f
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
              )}
            >
              {f}{f !== "All" && ` (${counts[f as keyof typeof counts] ?? 0})`}
            </button>
          ))}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={cn("w-3 h-3", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {loading && !connectors.length ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CircleX className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={onRefresh} className="mt-3 text-xs text-primary hover:underline">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Plug2 className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No connectors found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting filters</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
            >
              <ConnectorRow connector={c} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
