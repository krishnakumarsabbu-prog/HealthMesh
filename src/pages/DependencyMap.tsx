import { motion } from "framer-motion"
import { GitBranch, ArrowRight, Zap, TriangleAlert as AlertTriangle, Server, Database, Globe, RefreshCw } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SERVICE_NODES = [
  { id: "gateway", name: "api-gateway", type: "gateway", status: "healthy" as const, x: 50, y: 40 },
  { id: "auth", name: "auth-service", type: "service", status: "warning" as const, x: 200, y: 100 },
  { id: "payments", name: "payments-api", type: "api", status: "healthy" as const, x: 200, y: 220 },
  { id: "catalog", name: "catalog-service", type: "service", status: "healthy" as const, x: 380, y: 100 },
  { id: "search", name: "search-api", type: "api", status: "critical" as const, x: 380, y: 220 },
  { id: "recommend", name: "recommendation-engine", type: "ml", status: "degraded" as const, x: 560, y: 160 },
  { id: "db-primary", name: "db-primary", type: "database", status: "healthy" as const, x: 560, y: 280 },
  { id: "cache", name: "redis-cluster", type: "cache", status: "healthy" as const, x: 380, y: 340 },
]

const CONNECTIONS = [
  { from: "gateway", to: "auth", healthy: false },
  { from: "gateway", to: "payments", healthy: true },
  { from: "gateway", to: "catalog", healthy: true },
  { from: "gateway", to: "search", healthy: false },
  { from: "catalog", to: "recommend", healthy: true },
  { from: "payments", to: "db-primary", healthy: true },
  { from: "catalog", to: "cache", healthy: true },
  { from: "search", to: "cache", healthy: true },
  { from: "recommend", to: "db-primary", healthy: true },
]

const TYPE_ICON = {
  gateway: Globe,
  service: Server,
  api: Zap,
  ml: GitBranch,
  database: Database,
  cache: Database,
}

const STATUS_NODE_STYLES: Record<string, string> = {
  healthy: "border-emerald-500/40 bg-emerald-500/8 dark:bg-emerald-500/10",
  warning: "border-amber-500/40 bg-amber-500/8",
  critical: "border-red-500/40 bg-red-500/8 shadow-[0_0_12px_rgba(239,68,68,0.2)]",
  degraded: "border-orange-500/40 bg-orange-500/8",
}

export function DependencyMap() {
  return (
    <div className="min-h-full">
      <PageHeader
        title="Dependency Map"
        description="Real-time visualization of service topology, request flows, and dependency health"
        actions={
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        }
      />

      <div className="px-6 pb-6 space-y-4">
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground premium-card px-4 py-3 flex-wrap">
          <span className="font-semibold text-foreground">Legend:</span>
          {["healthy", "warning", "critical", "degraded"].map(s => (
            <span key={s} className="flex items-center gap-1.5 capitalize">
              <span className={cn("w-2.5 h-2.5 rounded-full",
                s === "healthy" ? "bg-emerald-500" :
                s === "warning" ? "bg-amber-500" :
                s === "critical" ? "bg-red-500 animate-pulse" : "bg-orange-500"
              )} />
              {s}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-emerald-500/60 border-dashed" /> Healthy flow</span>
            <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-red-500/60 border-dashed" /> Degraded flow</span>
          </span>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="premium-card overflow-hidden relative"
          style={{ height: 440 }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {CONNECTIONS.map((conn, i) => {
              const from = SERVICE_NODES.find(n => n.id === conn.from)
              const to = SERVICE_NODES.find(n => n.id === conn.to)
              if (!from || !to) return null
              return (
                <motion.line
                  key={i}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                  x1={from.x + 60}
                  y1={from.y + 24}
                  x2={to.x + 60}
                  y2={to.y + 24}
                  stroke={conn.healthy ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}
                  strokeWidth={2}
                  strokeDasharray="6,4"
                />
              )
            })}
          </svg>

          {SERVICE_NODES.map((node, i) => {
            const Icon = TYPE_ICON[node.type as keyof typeof TYPE_ICON] || Server
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 300 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className={cn(
                  "absolute cursor-pointer border-2 rounded-xl px-3 py-2 w-32 transition-all duration-150",
                  "hover:shadow-elevation-2",
                  STATUS_NODE_STYLES[node.status]
                )}
                style={{ left: node.x, top: node.y }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("w-3.5 h-3.5",
                    node.status === "healthy" ? "text-emerald-500" :
                    node.status === "warning" ? "text-amber-500" :
                    node.status === "critical" ? "text-red-500" : "text-orange-500"
                  )} />
                  <div className={cn("w-1.5 h-1.5 rounded-full ml-auto",
                    node.status === "critical" ? "bg-red-500 animate-pulse" :
                    node.status === "warning" ? "bg-amber-500" :
                    node.status === "healthy" ? "bg-emerald-500" : "bg-orange-500"
                  )} />
                </div>
                <div className="text-[11px] font-semibold font-mono text-foreground truncate">{node.name}</div>
                <div className="text-[9px] text-muted-foreground capitalize mt-0.5">{node.type}</div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Services", value: "247" },
            { label: "Active Connections", value: "1,824" },
            { label: "Degraded Paths", value: "3" },
            { label: "Avg Hop Latency", value: "12ms" },
          ].map((s, i) => (
            <div key={i} className="premium-card px-4 py-3">
              <div className="text-lg font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
